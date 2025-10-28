import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { generateHash, IOtp } from 'src/common';
import { OtpEnum } from 'src/common/enums/otp.enum';
import { emailEvent } from 'src/common/utils/events/email.event';

@Schema({ timestamps: true })
export class Otp implements IOtp {
  @Prop({ type: Types.ObjectId, required: true })
  _id: Types.ObjectId;
  @Prop({ type: String, required: true })
  code: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  createdBy: Types.ObjectId;

  @Prop({ type: Date, required: true })
  expiredAt: Date;

  @Prop({ type: String, enum: OtpEnum, required: true })
  type: OtpEnum;
}
export type OtpDocument = HydratedDocument<Otp>;
const otpSchema = SchemaFactory.createForClass(Otp);
otpSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.pre(
  'save',
  async function (
    this: OtpDocument & { wasNew?: boolean; plainOtp?: string },
    next,
  ) {
    this.wasNew = this.isNew;
    if (this.isModified('code')) {
      this.plainOtp = this.code;
      this.code = await generateHash(this.code);
      await this.populate([{ path: 'createdBy', select: 'email' }]);
      console.log({ this: this });
    }
    next();
  },
);

otpSchema.post('save', function (doc: OtpDocument, next) {
  const that = this as OtpDocument & { wasNew?: boolean; plainOtp?: string };
  if (that.wasNew) {
    emailEvent.emit(OtpEnum.confirm_email, {
      to: (that.createdBy as any).email,
      otp: that.plainOtp,
    });
  }
  next();
});
export const OtpModel = MongooseModule.forFeature([
  { name: Otp.name, schema: otpSchema },
]);
