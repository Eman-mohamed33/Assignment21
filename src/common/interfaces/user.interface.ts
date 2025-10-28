import { Types } from "mongoose";
import { GenderEnum, LanguageEnum, ProviderEnum, RoleEnum } from "../enums";
import { OtpDocument } from "src/DB";

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
}
