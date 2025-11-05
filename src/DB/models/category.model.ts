import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import { ICategory } from "src/common";
import { BrandModelHooks } from "./brand.model";
import { ProductModelHooks } from "./product.model";

@Schema({
  timestamps: true,
  strictQuery: true,
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Category implements ICategory {
  @Prop({ type: String, unique: true, minlength: 2, maxlength: 25, required: true })
  name: string;
  @Prop({ type: String, minlength: 2, maxlength: 50 })
  slug: string;
  @Prop({ type: String, minlength: 2, maxlength: 5000 })
  description: string;
  @Prop({ type: String, required: true })
  image: string;
  @Prop({ type: String, required: true })
  assetFolderId: string;
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: "User" })
  updatedBy: Types.ObjectId;
  @Prop({ type: [{ type: Types.ObjectId, ref: "Brand" }] })
  brands: Types.ObjectId[];
  @Prop({ type: Date })
  deletedAt: Date;
  @Prop({ type: Date })
  restoredAt: Date;
}
export type CategoryDocument = HydratedDocument<Category>;
const categorySchema = SchemaFactory.createForClass(Category);

categorySchema.virtual("products", {
  localField: "_id",
  foreignField: "category",
  ref: "Product",
});
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name);
  }
  next();
});

categorySchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const update = this.getUpdate() as UpdateQuery<CategoryDocument>;
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

categorySchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const query = this.getQuery();
  if (query.paranoId === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }
  next();
});

categorySchema.post(
  ["findOneAndDelete", "deleteOne"],
  async function (doc: CategoryDocument, next) {
    const query = this.getQuery();
    const categoryId = doc?._id || query?._id;

    if (categoryId) {
      await ProductModelHooks.deleteMany({ category: categoryId });
      await BrandModelHooks.deleteOne({ category: categoryId });
    }
    next();
  },
);
export const CategoryModel = MongooseModule.forFeature([
  {
    name: Category.name,
    schema: categorySchema,
  },
]);
