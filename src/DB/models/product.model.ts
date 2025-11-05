import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, model, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import { IProduct, IProductVariance } from "src/common";

@Schema({
  timestamps: true,
  strictQuery: true,
})
export class ProductVariance implements IProductVariance {
  @Prop({ type: String, required: false })
  size: string;
  @Prop({ type: String })
  sku: string;
  @Prop({ type: Number })
  stock: number;
  @Prop({ type: String, required: true })
  color: string;
  @Prop({ type: Number, required: true })
  price: number;
}
export type ProductVarianceDocument = HydratedDocument<ProductVariance>;
const productVarianceSchema = SchemaFactory.createForClass(ProductVariance);

@Schema({
  timestamps: true,
  strictQuery: true,
})
export class Product implements IProduct {
  @Prop({ type: String, unique: true, minlength: 2, maxlength: 2000, required: true })
  name: string;

  @Prop({ type: String, minlength: 2, maxlength: 50 })
  slug: string;

  @Prop({ type: String, minlength: 2, maxlength: 50000 })
  description: string;

  @Prop([{ type: String, required: true }])
  images: string[];

  @Prop({ type: String, required: true })
  assetFolderId: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User" })
  updatedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Brand", required: true })
  brand: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Category", required: true })
  category: Types.ObjectId;

  @Prop({ type: Number, required: true })
  originalPrice: number;

  @Prop({ type: Number, default: 0 })
  discountPercent: number;

  @Prop({ type: Number, required: true })
  salePrice: number;

  @Prop({ type: Number, required: true })
  stock: number;

  @Prop({ type: Number, default: 0 })
  soldItems: number;

  @Prop({ type: Date })
  deletedAt: Date;
  @Prop({ type: Date })
  restoredAt: Date;

  @Prop([productVarianceSchema])
  productVariance: Partial<ProductVariance>[];
}
export type ProductDocument = HydratedDocument<Product>;
const productSchema = SchemaFactory.createForClass(Product);

productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name);
  }
  next();
});

productSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const update = this.getUpdate() as UpdateQuery<ProductDocument>;
  if (update.name) {
    this.setUpdate({ ...update, slug: slugify(update.name) });
  }

  const query = this.getQuery();
  if (query.paranoId === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }
  next();
});

productSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const query = this.getQuery();
  if (query.paranoId === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }
  next();
});
export const ProductModelHooks = model(Product.name, productSchema);

export const ProductModel = MongooseModule.forFeature([
  {
    name: Product.name,
    schema: productSchema,
  },
]);
