import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import { CouponTypeEnum, ICoupon } from "src/common";

export class CouponBodyDto implements Partial<ICoupon> {
  @IsDateString()
  startDate: Date;
  @IsDateString()
  endDate: Date;
  @IsNotEmpty()
  @IsString()
  name: string;
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  duration: number;
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  discount: number;
  @IsEnum(CouponTypeEnum)
  type: CouponTypeEnum;
}
