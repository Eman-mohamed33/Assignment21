import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Types } from "mongoose";
import { GenderEnum, IUser, LanguageEnum, ProviderEnum, RoleEnum } from "src/common";

export class ProfileResponse {
  profile: IUser;
}

registerEnumType(ProviderEnum, {
  name: "ProviderEnum"
});

registerEnumType(GenderEnum, {
  name: "GenderEnum"
});

registerEnumType(RoleEnum, {
  name: "RoleEnum"
});

registerEnumType(LanguageEnum, {
  name: "LanguageEnum"
});

@ObjectType()
export class OneUserResponse implements IUser {
  
  @Field(() => ID)
  _id: Types.ObjectId;
  @Field(() => [ID], { nullable: true })
  wishlist?: Types.ObjectId[];
  
  @Field(() => String)
  firstName: string;
  @Field(() => String)
  lastName: string;
  @Field(() => String, { nullable: true })
  username?: string;
  @Field(() => String)
  email: string;
  @Field(() => String, { nullable: true })
  password?: string;
  @Field(() => String, { nullable: true })
  resetPasswordOtp?: string;
  @Field(() => String)
  profilePicture: string;

  @Field(() => Date, { nullable: true })
  confirmEmail?: Date;
  @Field(() => Date, { nullable: true })
  changeCredentialsTime?: Date;
  @Field(() => Date, { nullable: true })
  createdAt?: Date;
  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => ProviderEnum)
  provider: ProviderEnum;
  @Field(() => GenderEnum)
  gender: GenderEnum;
  @Field(() => RoleEnum)
  role: RoleEnum;
  @Field(() => LanguageEnum)
  PreferredLanguage: LanguageEnum;
}
