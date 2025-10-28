import { Type } from "class-transformer";
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Types } from "mongoose";
import { IProduct } from "src/common";

export class ProductBodyDto implements Partial<IProduct> {
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50000)
  @IsOptional()
  description: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  originalPrice: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  discountPercent: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  stock: number;

  @IsMongoId()
  category: Types.ObjectId;

  @IsMongoId()
  brand: Types.ObjectId;
}
