import { IsEnum, IsMongoId, IsOptional, IsString, Matches } from "class-validator";
import { Types } from "mongoose";
import { IOrder, PaymentTypeEnum } from "src/common";

export class OrderParamDto {
  @IsMongoId()
  orderId: Types.ObjectId;
}
export class OrderBodyDto implements Partial<IOrder> {
  @IsString()
  address: string;
  @IsString()
  @IsOptional()
  note: string;
  @IsString()
  @Matches(/^(002|\+2)?01[0125][0-9]{8}$/)
  phone: string;
  @IsEnum(PaymentTypeEnum)
  paymentType: PaymentTypeEnum;
}
