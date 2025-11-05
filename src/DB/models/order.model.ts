import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { IOrder, IOrderProduct, OrderStatusEnum, PaymentTypeEnum } from "src/common";

@Schema({
  timestamps: true,
  strictQuery: true,
})
export class OrderProduct implements IOrderProduct {
  @Prop({ type: Types.ObjectId, ref: "Product", required: true })
  productId: Types.ObjectId;
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: Number, required: true })
  quantity: number;
  @Prop({ type: Number, required: true })
  unitPrice: number;
  @Prop({ type: Number, required: true })
  finalPrice: number;
}
const orderProductSchema = SchemaFactory.createForClass(OrderProduct);
export type OrderProductDocument = HydratedDocument<OrderProduct>;

@Schema({
  timestamps: true,
  strictQuery: true,
})
export class Order implements IOrder {
  @Prop({ type: String, required: true })
  address: string;
  @Prop({ type: String, required: true })
  phone: string;
  @Prop({ type: String })
  note: string;
  @Prop({ type: Number, required: true })
  subtotal: number;
  @Prop({ type: Number })
  discount: number;
  @Prop({ type: Number, required: true })
  total: number;
  @Prop({ type: String, enum: PaymentTypeEnum, default: PaymentTypeEnum.Cash })
  paymentType: PaymentTypeEnum;
  @Prop({
    type: String,
    enum: OrderStatusEnum,
    default: function (this: Order) {
      return this.paymentType === PaymentTypeEnum.Card
        ? OrderStatusEnum.Pending
        : OrderStatusEnum.Placed;
    },
  })
  status: OrderStatusEnum;
  @Prop({ type: String, required: true })
  orderId: string;
  @Prop({ type: String })
  cancelReason: string;
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: "User" })
  updatedBy: Types.ObjectId;
  @Prop({ type: Date })
  deletedAt: Date;
  @Prop({ type: Date })
  restoredAt: Date;
  @Prop([orderProductSchema])
  products: OrderProduct[];
  @Prop({ type: Date })
  paidAt: Date;
  @Prop({ type: String })
  intentId: string;
  @Prop({ type: Types.ObjectId, ref: "Coupon" })
  coupon: Types.ObjectId;
}
const orderSchema = SchemaFactory.createForClass(Order);
export type OrderDocument = HydratedDocument<Order>;
orderSchema.pre("save", function (next) {
  if (this.isModified("total")) {
    this.subtotal = this.total - this.total * ((this.discount ?? 0) / 100);
  }
  next();
});

export const OrderModel = MongooseModule.forFeature([{ name: Order.name, schema: orderSchema }]);
