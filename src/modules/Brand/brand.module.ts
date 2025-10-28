import { Module } from "@nestjs/common";
import { BrandController } from "./brand.controller";
import { BrandService } from "./brand.service";
import { BrandModel, BrandRepository } from "src/DB";
import { S3Service } from "src/common";

@Module({
  imports: [BrandModel],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository, S3Service],
  exports: [],
})
export class BrandModule {}
