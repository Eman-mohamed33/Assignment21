import { Types } from "mongoose";
import { IUser } from "./user.interface";

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
}
