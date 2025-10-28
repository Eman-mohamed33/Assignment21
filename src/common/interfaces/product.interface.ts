import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { IBrand } from "./brand.interface";
import { ICategory } from "./category.interface";

export interface IProduct {
  _id?: Types.ObjectId;
  createdBy: Types.ObjectId | IUser;
  name: string;
  slug: string;
  description?: string;
  originalPrice: number;
  discountPercent: number;
  salePrice: number;
  stock: number;
  soldItems: number;
  category: Types.ObjectId | ICategory;
  brand: Types.ObjectId | IBrand;
  images: string[];
  assetFolderId: string;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: Types.ObjectId | IUser;
  deletedAt?: Date;
  restoredAt?: Date;
}
