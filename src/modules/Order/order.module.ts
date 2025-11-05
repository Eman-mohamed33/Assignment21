import { Module } from "@nestjs/common";
import {
  CartModel,
  CartRepository,
  CouponModel,
  CouponRepository,
  OrderModel,
  OrderRepository,
  ProductModel,
  ProductRepository,
} from "src/DB";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { CartService } from "../Cart/cart.service";
import { PaymentService } from "src/common";

@Module({
  imports: [OrderModel, CartModel, ProductModel, CouponModel],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    CartRepository,
    ProductRepository,
    CartService,
    PaymentService,
    CouponRepository,
  ],
  exports: [],
})
export class OrderModule {}
