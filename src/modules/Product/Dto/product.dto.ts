import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Types } from "mongoose";
import { IProduct, IProductVariance } from "src/common";
import { ContainField } from "src/common/decorators";

export class ProductVarianceBodyDto implements Partial<IProductVariance> {
  @IsString()
  @IsNotEmpty()
  color: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  @IsOptional()
  size: string;

  @IsString()
  @IsOptional()
  sku: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  stock: number;
}
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

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductVarianceBodyDto)
  productVariance: IProductVariance[];
}

@ContainField()
export class UpdateProductBodyDto extends PartialType(ProductBodyDto) { }
export class UpdateProductAttachmentsBodyDto {
  @IsArray()
  @IsOptional()
  removedAttachments?: string[];
}

export class ProductParamDto {
  @IsMongoId()
  productId: Types.ObjectId;
}

