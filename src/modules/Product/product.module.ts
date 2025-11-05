import { Module } from "@nestjs/common";
import {
  BrandModel,
  BrandRepository,
  CategoryModel,
  CategoryRepository,
  ProductModel,
  ProductRepository,
  UserModel,
  UserRepository,
} from "src/DB";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { S3Service } from "src/common";

@Module({
  imports: [ProductModel, BrandModel, CategoryModel, UserModel],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    BrandRepository,
    CategoryRepository,
    S3Service,
    UserRepository,
  ],
  exports: [],
})
export class ProductModule {}
