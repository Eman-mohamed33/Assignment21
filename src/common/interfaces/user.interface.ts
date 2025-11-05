import { Types } from "mongoose";
import { GenderEnum, LanguageEnum, ProviderEnum, RoleEnum } from "../enums";
import { OtpDocument } from "src/DB";
import { IProduct } from "./product.interface";

export interface IUser {
  _id?: Types.ObjectId;

  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  password?: string;
  confirmEmail?: Date;
  changeCredentialsTime?: Date;
  provider: ProviderEnum;
  gender: GenderEnum;
  role: RoleEnum;
  resetPasswordOtp?: string;
  otp?: OtpDocument[];
  PreferredLanguage: LanguageEnum;
  profilePicture: string;
  createdAt?: Date;
  updatedAt?: Date;
  wishlist?: Types.ObjectId[] | IProduct[];
}
