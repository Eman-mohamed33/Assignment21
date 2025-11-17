import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

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

@InputType()
export class GetAllGraphQlDto {
  @Field(() => Number)
  @IsInt()
  @IsPositive()
  @IsNumber()
  @IsOptional()
  page?: number;
  @Field(() => Number)
  @IsPositive()
  @IsInt()
  @IsNumber()
  @IsOptional()
  size?: number;
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  search?: string;
}
