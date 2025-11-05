import { BadRequestException } from "@nestjs/common";
import type { Request } from "express";
import Stripe from "stripe";

export class PaymentService {
    private stripe: Stripe;
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET as string);
    }

    async checkoutSession({
        customer_email,
        cancel_url = process.env.CANCEL_URL,
        success_url = process.env.SUCCESS_URL,
        metadata = {},
        discounts = [],
        line_items,
        mode = "payment",
    }:Stripe.Checkout.SessionCreateParams):Promise<Stripe.Response<Stripe.Checkout.Session>> {
        const session = await this.stripe.checkout.sessions.create({
            customer_email,
            cancel_url,
            success_url,
            metadata,
            discounts,
            line_items,
            mode,
        });
        return session;
    }

    async createCoupon(data: Stripe.CouponCreateParams): Promise<Stripe.Response<Stripe.Coupon>> {
        const coupon = await this.stripe.coupons.create(data)
        return coupon;
    }

    async webhook(req: Request): Promise<Stripe.CheckoutSessionCompletedEvent> {
        const event: Stripe.Event = this.stripe.webhooks.constructEvent(
            req.body,
            req.headers['stripe-signature'] as string,
            process.env.STRIPE_HOOK_SECRET as string
        );

        if (event.type != "checkout.session.completed") {
            throw new BadRequestException("Fail to pay");
        }
        console.log({ event });
        
        return event;
    }

    async createPaymentMethod(data: Stripe.PaymentMethodCreateParams): Promise<Stripe.Response<Stripe.PaymentMethod>> {
        const method = await this.stripe.paymentMethods.create(data);
        return method;
    }
    async createPaymentIntent(data: Stripe.PaymentIntentCreateParams): Promise<Stripe.Response<Stripe.PaymentIntent>> {
        const Intent = await this.stripe.paymentIntents.create(data);
        return Intent;
    }

    async retrievePaymentIntent(id: string):Promise<Stripe.Response<Stripe.PaymentIntent>> {
        const retrieve = await this.stripe.paymentIntents.retrieve(id);
        return retrieve;
    }

    async confirmPaymentIntent(id: string): Promise<Stripe.Response<Stripe.PaymentIntent>> {
        const Intent = await this.retrievePaymentIntent(id);
        if (Intent?.status !== "requires_confirmation") {
            throw new BadRequestException("Fail to find payment intent");
        }
        const confirm = await this.stripe.paymentIntents.confirm(id);
        return confirm;
    }

    async refund(id: string): Promise<Stripe.Response<Stripe.Refund>> {
        const Intent = await this.retrievePaymentIntent(id);
        if (Intent?.status !== "succeeded") {
            throw new BadRequestException("Fail to find payment intent");
        }
        const refund = await this.stripe.refunds.create({
            payment_intent: Intent.id,
        });
        return refund;
    }
    
}