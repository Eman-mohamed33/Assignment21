import { IsMongoId, IsNumber, IsPositive, Min, Validate } from "class-validator";
import { Types } from "mongoose";
import { ICartProducts } from "src/common";
import { MongoDBIds } from "src/modules/Category/Dto/category.dto";

export class CartBodyDto implements Partial<ICartProducts> {
  @IsMongoId()
  productId: Types.ObjectId;
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}

export class removeItemsBodyDto {
  @Validate(MongoDBIds)
  productIds: Types.ObjectId[];
}
