import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Types } from "mongoose";
import { IBrand } from "src/common";
import { ContainField } from "src/common/decorators";

export class BrandBodyDto implements Partial<IBrand> {
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  name: string;
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  slogan: string;
}

export class BrandParamsDto {
  @IsMongoId()
  brandId: Types.ObjectId;
}

@ContainField()
export class UpdateBodyDto extends PartialType(BrandBodyDto) {}

export class GetAllDto {
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @IsOptional()
  page: number;
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @IsOptional()
  size: number;
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  search: string;
}
