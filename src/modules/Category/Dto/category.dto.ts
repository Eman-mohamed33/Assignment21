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
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { Types } from "mongoose";
import { ICategory } from "src/common";
import { ContainField } from "src/common/decorators";

@ValidatorConstraint({ name: 'match-between-fields', async: false })
export class MongoDBIds implements ValidatorConstraintInterface {
  validate(ids: Types.ObjectId[], args: ValidationArguments) {
    for (const id of ids) {
      if (!Types.ObjectId.isValid(id)) {
          return false;
}
    }
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return `fail to match src field :: ${args?.property} with target field :: ${args?.constraints[0]}`;
  }
}
export class CategoryBodyDto implements Partial<ICategory> {
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  name: string;
  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  @IsOptional()
  description: string;
  @Validate(MongoDBIds)
  @IsOptional()
  brands: Types.ObjectId[];
}

export class CategoryParamsDto {
  @IsMongoId()
  categoryId: Types.ObjectId;
}

@ContainField()
export class UpdateCategoryBodyDto extends PartialType(CategoryBodyDto) {
  @Validate(MongoDBIds)
  @IsOptional()
  removeBrand?: Types.ObjectId[];
}

export class GetAllDtoCategory {
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
