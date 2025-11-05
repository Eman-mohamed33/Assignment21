import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { CouponTypeEnum } from "../enums";

export interface ICoupon {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  createdBy: Types.ObjectId | IUser;
  usedBy?: Types.ObjectId[] | IUser[];
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: Types.ObjectId | IUser;
  deletedAt?: Date;
  restoredAt?: Date;
  startDate: Date;
  endDate: Date;
  duration: number;
  discount: number;
  type: CouponTypeEnum;
}
