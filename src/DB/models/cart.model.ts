import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { ICart, ICartProducts } from "src/common";

@Schema({ timestamps: true, strictQuery: true })
export class CartProducts implements ICartProducts {
  @Prop({ type: Types.ObjectId, ref: "Product", required: true })
  productId: Types.ObjectId;
  @Prop({ type: Number, required: true })
  quantity: number;
}
const cartProductsSchema = SchemaFactory.createForClass(CartProducts);
export type CartProductsDocument = HydratedDocument<CartProducts>;

@Schema({ timestamps: true, strictQuery: true })
export class Cart implements ICart {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, unique: true })
  createdBy: Types.ObjectId;
  @Prop([cartProductsSchema])
  products: CartProducts[];
}
const cartSchema = SchemaFactory.createForClass(Cart);
export type CartDocument = HydratedDocument<Cart>;

export const CartModel = MongooseModule.forFeature([{ name: Cart.name, schema: cartSchema }]);
