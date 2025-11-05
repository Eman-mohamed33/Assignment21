import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { IProduct } from "./product.interface";
import { OrderStatusEnum, PaymentTypeEnum } from "../enums";
import { ICoupon } from "./coupon.interface";

export interface IOrderProduct {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  productId: Types.ObjectId | IProduct;
  name: string;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
}

export interface IOrder {
  _id?: Types.ObjectId;

  createdBy: Types.ObjectId | IUser;
  address: string;
  phone: string;
  note?: string;
  products: IOrderProduct[];
  subtotal: number;
  discount?: number;
  total: number;
  paymentType: PaymentTypeEnum;
  status: OrderStatusEnum;
  orderId: string;
  cancelReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: Types.ObjectId | IUser;
  deletedAt?: Date;
  restoredAt?: Date;
  paidAt?: Date;
  intentId?: string;
  coupon?: Types.ObjectId | ICoupon;
}
