import { Module } from "@nestjs/common";
import { CartModel, CartRepository, ProductModel, ProductRepository } from "src/DB";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";

@Module({
  imports: [CartModel, ProductModel],
  controllers: [CartController],
  providers: [CartService, CartRepository, ProductRepository],
  exports: [],
})
export class CartModule {}
