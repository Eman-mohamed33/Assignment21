import { Types } from "mongoose";
import { OtpEnum } from "../enums";
import { IUser } from "./user.interface";

export interface IOtp {
    _id?: Types.ObjectId;
    code: string;
    createdBy: Types.ObjectId | IUser;
    expiredAt: Date;
    type: OtpEnum;
    createdAt?: Date;
    updatedAt?: Date;
}