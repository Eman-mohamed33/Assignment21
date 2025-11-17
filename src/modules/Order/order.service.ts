import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CartRepository, CouponRepository, OrderDocument, OrderProduct, OrderRepository, ProductDocument, ProductRepository, type UserDocument } from "src/DB";
import { OrderBodyDto } from "./Dto/order.dto";
import { randomUUID } from "crypto";
import { CartService } from "../Cart/cart.service";
import { Types } from "mongoose";
import { OrderStatusEnum, PaymentService, PaymentTypeEnum } from "src/common";
import Stripe from "stripe";
import { Request } from "express";
import { RealtimeGateway } from "../Gateway/gateway";
import { GetAllDto, GetAllGraphQlDto } from "src/common/dtos";
import { lean } from "src/DB/repository/db.repository";

@Injectable()
export class OrderService {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly productRepository: ProductRepository,
        private readonly cartRepository: CartRepository,
        private readonly cartService: CartService,
        private readonly paymentService: PaymentService,
        private readonly couponRepository: CouponRepository,
        private readonly realtimeGateway: RealtimeGateway,
    ) { }
    
    async webhook(req: Request) {

        const event = await this.paymentService.webhook(req);
        const { orderId } = event.data.object.metadata as { orderId: string };
        const order = await this.orderRepository.findOneAndUpdate({
            filter: {
                _id: Types.ObjectId.createFromHexString(orderId),
                status: OrderStatusEnum.Pending,
                paymentType: PaymentTypeEnum.Card
            },
            update: {
                paidAt: new Date(),
                status: OrderStatusEnum.Placed,
            }
        })
        if (!order) {
            throw new NotFoundException("Fail to find matching order");
        }

        await this.paymentService.confirmPaymentIntent(order.intentId);
        return "";
    }

    async create(user: UserDocument, body: OrderBodyDto): Promise<OrderDocument> {

        const cart = await this.cartRepository.findOne({
            filter: {
                createdBy: user._id
            }
        });
        if (!cart?.products?.length) {
            throw new BadRequestException("User cart is empty");
        }
        let total: number = 0;
        const products: OrderProduct[] = [];
        for (const product of cart.products) {
            const checkProduct = await this.productRepository.findOne({
                filter: {
                    _id: product.productId,
                    stock: { $gte: product.quantity },
                }
            })
            if (!checkProduct) {
                throw new BadRequestException(`Fail to find matching product with id ::: ${product.productId.toString()} or out of stock`)
            }
            const finalPrice = product.quantity * checkProduct.salePrice;
            products.push({
                name: checkProduct.name,
                quantity: product.quantity,
                unitPrice: checkProduct.salePrice,
                finalPrice,
                productId: checkProduct._id,
            });
            total += finalPrice;

        }
        const [order] = await this.orderRepository.create({
            data: [{
                ...body,
                createdBy: user._id,
                products,
                orderId: randomUUID().slice(0,8),
                total
            }]
        });
        if (!order) {
            throw new BadRequestException("fail to create new order")
        }

        let stockProducts: { productId: Types.ObjectId, stock: number }[] = [];

        for (const product of cart.products) {
            const updatedProduct = await this.productRepository.findOneAndUpdate({
                filter: {
                    _id: product.productId,
                    stock: { $gte: product.quantity },
                },
                update: {
                    $inc: { stock: -product.quantity, __v: 1 },
                }
            }) as ProductDocument;
            stockProducts.push({ productId: updatedProduct?._id, stock: updatedProduct?.stock });
        }
        this.realtimeGateway.changeProductStock(stockProducts);
        await this.cartService.remove(user);
        return order;

    }

    async cancel(orderId: Types.ObjectId, user: UserDocument): Promise<OrderDocument> {
        const order = await this.orderRepository.findOneAndUpdate({
            filter: {
                _id: orderId,
                status: { $ne: OrderStatusEnum.Canceled },
            },
            update: {
                status: OrderStatusEnum.Canceled,
                updatedBy: user._id,
            }
        });
        if (!order) {
            throw new NotFoundException("Fail to find matching order");
        }

        for (const product of order.products) {
            await this.productRepository.updateOne({
                filter: {
                    _id: product.productId,
                },
                update: {
                    $inc: { stock: product.quantity, __v: 1 },
                }
            });
        }

        if (order.coupon) {
            await this.couponRepository.updateOne({
                filter: {
                    _id: order.coupon
                },
                update: {
                    $pull: { usedBy: order.createdBy },
                }
            })
        }
        
        if (order.paymentType === PaymentTypeEnum.Card) {
            await this.paymentService.refund(order.intentId);
        }
        return order as OrderDocument;
    }

    async checkout(orderId: Types.ObjectId, user: UserDocument) {
        const order = await this.orderRepository.findOne({
            filter: {
                _id: orderId,
                createdBy: user._id,
                paymentType: PaymentTypeEnum.Card,
                status: OrderStatusEnum.Pending
            },
            options: {
                populate: [{
                    path: "products.productId",
                    select: "name"
                }]
            }
        });
        if (!order) {
            throw new NotFoundException("Fail to find matching order");
        }

        let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
        if (order.discount) {
            const coupon = await this.paymentService.createCoupon({
                duration: 'once',
                currency: 'egp',
                percent_off: order.discount * 100,
            })

            discounts.push({ coupon: coupon.id });
        }
        const session = await this.paymentService.checkoutSession({
            customer_email: user.email,
            discounts,
            metadata: { orderId: orderId.toString() },
            line_items: order.products.map((product) => {
                return {
                    quantity:product.quantity,
                price_data: {
                    currency: 'egp',
                    product_data: {
                        name: (product.productId as unknown as ProductDocument).name
                    },
                    unit_amount: product.unitPrice
                }
                }
            })
        })

        const method = await this.paymentService.createPaymentMethod({
            type: "card",
            card: {
                token: "tok_visa"
            }
        });

        const Intent = await this.paymentService.createPaymentIntent({
            amount: order.subtotal * 100,
            currency: "egp",
            payment_method: method.id,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never",
            }
        })

        order.intentId = Intent.id;
        await order.save();
        return session;
    }

    async getAll(data: GetAllGraphQlDto = {}, archived: boolean = false): Promise<{
            docsCount?: number | undefined,
            pages?: number | undefined,
            currentPage?: number | string | undefined,
            limit?: number | undefined,
            result: OrderDocument[] | [] | lean<OrderDocument>[],
        }> {
        const { page, size, search } = data;
            const orders = await this.orderRepository.paginate({
                filter: {
                    ...(archived ? { paranoId: false, deletedAt: { $exists: true } } : {}),
                },
                page,
                size,
                options: {
                    populate: [{
                        path:"createdBy"
                    }],
                }
            });
        
            return orders;
        }
}