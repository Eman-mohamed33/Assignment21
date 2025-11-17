import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Types } from "mongoose";
import { IOrder, IOrderProduct,type IUser, OrderStatusEnum, PaymentTypeEnum } from "src/common";
import { OneUserResponse } from "src/modules/User/entities/user.entity";

registerEnumType(OrderStatusEnum, {
  name: "OrderStatusEnum"
});

registerEnumType(PaymentTypeEnum, {
  name: "PaymentTypeEnum"
});
export class OrderResponse {
  order: IOrder;
}

@ObjectType()
export class OneOrderProductResponse implements IOrderProduct {
  @Field(() => ID)
  _id: Types.ObjectId;
  @Field(() => ID)
  productId: Types.ObjectId;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => String)
  name: string;

  @Field(() => Number)
  quantity: number;
  @Field(() => Number)
  unitPrice: number;
  @Field(() => Number)
  finalPrice: number;
}

@ObjectType({ description: "one order response" })
export class OneOrderResponse implements IOrder {
 @Field(() => String, { nullable: true })
  cancelReason?: string;

 @Field(() => String, { nullable: true })
  note?: string;
   @Field(() => String, { nullable: true })
  intentId?: string;
   @Field(() => String)
    orderId: string;
   @Field(() => String)
  address: string; 
   @Field(() => String)
  phone: string;

  @Field(() => ID, { nullable: true })
  coupon?: Types.ObjectId;
  @Field(() => OneUserResponse)
  createdBy: IUser;
  @Field(() => ID)
  _id: Types.ObjectId;
  @Field(() => ID, { nullable: true })
  updatedBy?: Types.ObjectId;

  
  

  
  @Field(() => Date, { nullable: true })
  createdAt?: Date;
@Field(() => Date, { nullable: true })
  updatedAt?: Date;
  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
 @Field(() => Date, { nullable: true })
  paidAt?: Date;
  @Field(() => Date, { nullable: true })
  restoredAt?: Date;

  @Field(() => [OneOrderProductResponse])
  products: IOrderProduct[];

  @Field(() => OrderStatusEnum)
  status: OrderStatusEnum;
  @Field(() => PaymentTypeEnum)
  paymentType: PaymentTypeEnum;


  @Field(() => Number)
  subtotal: number;
  @Field(() => Number)
  total: number;
  @Field(() => Number, { nullable: true })
  discount?: number;
}
  
@ObjectType({description:"get all orders"})
export class GetAllOrdersResponse {
  @Field(() => Number, { nullable: true })
  docsCount?: number;
  @Field(() => Number, { nullable: true })
  pages?: number;
  @Field(() => Number, { nullable: true })
  currentPage?: number | string;
  @Field(() => Number, { nullable: true })
  limit?: number;
  @Field(() => [OneOrderResponse])
  result: IOrder[];
}
