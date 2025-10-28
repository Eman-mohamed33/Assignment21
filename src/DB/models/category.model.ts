import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import { ICategory } from "src/common";

@Schema({
  timestamps: true,
  strictQuery: true,
  strict: true,
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
  @Prop([{ type: Types.ObjectId, ref: "Brand" }])
  brands: Types.ObjectId[];
  @Prop({ type: Date })
  deletedAt: Date;
  @Prop({ type: Date })
  restoredAt: Date;
}
export type CategoryDocument = HydratedDocument<Category>;
const categorySchema = SchemaFactory.createForClass(Category);

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
export const CategoryModel = MongooseModule.forFeature([
  {
    name: Category.name,
    schema: categorySchema,
  },
]);
