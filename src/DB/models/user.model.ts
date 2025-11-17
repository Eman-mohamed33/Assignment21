import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
  GenderEnum,
  generateHash,
  IUser,
  LanguageEnum,
  ProviderEnum,
  RoleEnum,
} from "src/common";
import { OtpDocument } from "./otp.model";
import { md5_base64 } from "node_modules/zod/v4/core/regexes.cjs";
@Schema({
  timestamps: true,
  strictQuery: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class User implements IUser{
  @Prop({
    type: String,
    minlength: 2,
    maxlength: 500,
    required: true,
    trim: true,
  })
  firstName: string;
  @Prop({
    type: String,
    minlength: 2,
    maxlength: 500,
    required: true,
    trim: true,
  })
  lastName: string;

  @Virtual({
    get: function (this: User) {
      return this.firstName + ' ' + this.lastName;
    },
    set: function (value: string) {
      const [firstName, lastName] = value.split(' ') || [];
      this.set({ firstName, lastName });
    },
  })
  username: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    required: function (this: User) {
      return this.provider === ProviderEnum.google ? false : true;
    },
  })
  password: string;

  @Prop({
    type: Date,
    required: false,
  })
  confirmEmail: Date;

  @Prop({
    type: Date,
    required: false,
  })
  changeCredentialsTime: Date;
  @Prop({
    type: String,
    enum: ProviderEnum,
    default: ProviderEnum.system,
  })
  provider: ProviderEnum;

  @Prop({
    type: String,
    enum: GenderEnum,
    default: GenderEnum.male,
  })
  gender: GenderEnum;

  @Prop({
    type: String,
    enum: RoleEnum,
    default: RoleEnum.user,
  })
  role: RoleEnum;

  @Prop({
    type: String,
    required: false,
  })
  resetPasswordOtp: string;

  @Prop([{ type: Types.ObjectId, ref: 'Otp' }])
  otp?: OtpDocument[];

  @Prop({
    type: String,
    enum: LanguageEnum,
    default: LanguageEnum.EN,
  })
  PreferredLanguage: LanguageEnum;

  @Prop({ type: String })
  profilePicture: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: "Product" }] })
  wishlist?: Types.ObjectId[];
}
const userSchema = SchemaFactory.createForClass(User);
// userSchema.virtual('otp', {
//   localField: '_id',
//   foreignField: 'createdBy',
//   ref: 'Otp',
//   justOne: false,
// });

export type UserDocument = HydratedDocument<User>;

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await generateHash(this.password);
  }

  next();
});

export const UserModel = MongooseModule.forFeature([
    {
    name: User.name,
    schema: userSchema,
    }
]);

export const connectedSockets = new Map<string, string[]>();
// export const UserModel = MongooseModule.forFeatureAsync([
//     {
//     name: User.name,
//       useFactory:()=> {
//         userSchema.pre('save', async function (next) {
//           if (this.isModified('password')) {
//             this.password = await generateHash(this.password);
//           }
//           next();
//         });
//         return userSchema;
//       },
//     }
// ]);
