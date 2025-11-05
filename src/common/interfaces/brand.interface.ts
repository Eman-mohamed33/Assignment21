import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { ICategory } from "./category.interface";

export interface IBrand {
  _id?: Types.ObjectId;
  createdBy: Types.ObjectId | IUser;
  name: string;
  slug: string;
  slogan: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: Types.ObjectId | IUser;
  deletedAt?: Date;
  restoredAt?: Date;
  category?: Types.ObjectId | ICategory;
}
