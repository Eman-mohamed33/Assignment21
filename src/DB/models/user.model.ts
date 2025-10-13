import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { GenderEnum, generateHash, ProviderEnum, RoleEnum } from "src/common";

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
export class User {
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
    type: String,
    required: false,
  })
  confirmEmailOtp: string;

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
  resetPasswordOtp: string
}

const userSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await generateHash(this.password);
  }

  if (this.isModified('confirmEmailOtp') && this.confirmEmailOtp) {
    this.confirmEmailOtp = await generateHash(this.confirmEmailOtp);
  }
  next();
});

export const UserModel = MongooseModule.forFeature([
    {
    name: User.name,
    schema: userSchema,
    }
]);

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

