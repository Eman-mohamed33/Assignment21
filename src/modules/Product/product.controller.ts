import { Body, Controller, ParseFilePipe, Post, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ProductService } from "./product.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CloudFileUpload, fileValidation } from "src/common/utils/multer";
import { Auth, User } from "src/common/decorators";
import { productEndPoint } from "./product.authorization";
import type { UserDocument } from "src/DB";
import { ProductBodyDto } from "./Dto/product.dto";
import { StorageEnum, successResponse } from "src/common";
import { ProductResponse } from "./entities/product.entity";
import { IResponse } from "src/common/interfaces/response.interface";

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller("product")
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @UseInterceptors(FilesInterceptor("attachments", 5, CloudFileUpload({
    storageApproach: StorageEnum.disk,
    validation: fileValidation.image
  })))
  @Auth(productEndPoint.create)
  @Post()
  async createProduct(
    @User() user: UserDocument,
    @UploadedFiles(ParseFilePipe) files: Express.Multer.File[],
    @Body() body: ProductBodyDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.create(user, files, body);
    return successResponse<ProductResponse>({ status: 201, data: { product } });
  }
}
