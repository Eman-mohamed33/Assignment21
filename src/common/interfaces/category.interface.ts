import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { IBrand } from "./brand.interface";

export interface ICategory {
  _id?: Types.ObjectId;
  createdBy: Types.ObjectId | IUser;
  name: string;
  description?: string;
  brands?: Types.ObjectId[] | IBrand[];
  slug: string;
  image: string;
  assetFolderId: string;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: Types.ObjectId | IUser;
  deletedAt?: Date;
  restoredAt?: Date;
}
