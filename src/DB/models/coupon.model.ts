import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import slugify from "slugify";
import { CouponTypeEnum, ICoupon } from "src/common";

@Schema({
  timestamps: true,
  strictQuery: true,
})
export class Coupon implements ICoupon {
  @Prop({ type: String, unique: true, minlength: 2, maxlength: 25, required: true })
  name: string;
  @Prop({ type: String, minlength: 2, maxlength: 50 })
  slug: string;
  @Prop({ type: String, required: true })
  image: string;
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: "User" })
  updatedBy: Types.ObjectId;
  @Prop({ type: Date })
  deletedAt: Date;
  @Prop({ type: Date })
  restoredAt: Date;
  @Prop({ type: Date, required: true })
  endDate: Date;
  @Prop({ type: Date, required: true })
  startDate: Date;
  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }] })
  usedBy: Types.ObjectId[];
  @Prop({ type: Number, required: true })
  discount: number;
  @Prop({ type: Number, default: 1 })
  duration: number;
  @Prop({ type: String, enum: CouponTypeEnum, default: CouponTypeEnum.Percent })
  type: CouponTypeEnum;
}
const couponSchema = SchemaFactory.createForClass(Coupon);
export type CouponDocument = HydratedDocument<Coupon>;

couponSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name);
  }
  next();
});

export const CouponModel = MongooseModule.forFeature([{ name: Coupon.name, schema: couponSchema }]);
