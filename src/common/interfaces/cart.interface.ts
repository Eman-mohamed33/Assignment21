import { Types } from "mongoose";
import { IProduct } from "./product.interface";
import { IUser } from "./user.interface";

export interface ICartProducts {
  _id?: Types.ObjectId;
  productId: Types.ObjectId | IProduct;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface ICart {
  _id?: Types.ObjectId;
  createdBy: Types.ObjectId | IUser;
  products: ICartProducts[];
  createdAt?: Date;
  updatedAt?: Date;
}
