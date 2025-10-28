import { Module } from "@nestjs/common";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { BrandModel, BrandRepository, CategoryModel, CategoryRepository } from "src/DB";
import { S3Service } from "src/common";

@Module({
  imports: [CategoryModel, BrandModel],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository, BrandRepository, S3Service],
  exports: [],
})
export class CategoryModule {}
