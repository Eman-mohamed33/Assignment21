import { Module } from "@nestjs/common";
import {
  BrandModel,
  BrandRepository,
  CategoryModel,
  CategoryRepository,
  ProductModel,
  ProductRepository,
} from "src/DB";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { S3Service } from "src/common";

@Module({
  imports: [ProductModel, BrandModel, CategoryModel],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, BrandRepository, CategoryRepository, S3Service],
  exports: [],
})
export class ProductModule {}
