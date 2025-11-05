import { Body, Controller, Delete, Get, Param, ParseFilePipe, Patch, Post, Query, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ProductService } from "./product.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CloudFileUpload, fileValidation } from "src/common/utils/multer";
import { Auth, User } from "src/common/decorators";
import { productEndPoint } from "./product.authorization";
import type { UserDocument } from "src/DB";
import { ProductBodyDto, ProductParamDto, UpdateProductAttachmentsBodyDto, UpdateProductBodyDto } from "./Dto/product.dto";
import { IProduct, RoleEnum, StorageEnum, successResponse } from "src/common";
import { ProductResponse } from "./entities/product.entity";
import { IResponse } from "src/common/interfaces/response.interface";
import { GetAllDto } from "src/common/dtos";
import { GetAllResponse } from "src/common/entities";

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

  @Auth(productEndPoint.create)
  @Patch(":productId")
  async updateProduct(
    @Param() param: ProductParamDto,
    @User() user: UserDocument,
    @Body() body: UpdateProductBodyDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.update(body, user, param.productId);
    return successResponse<ProductResponse>({ data: { product } });
  }


  @UseInterceptors(FilesInterceptor("attachments", 5, CloudFileUpload({
    storageApproach: StorageEnum.disk,
    validation: fileValidation.image
  })))
  @Auth(productEndPoint.create)
  @Patch(":productId/attachments")
  async updateProductAttachments(
    @Body() body: UpdateProductAttachmentsBodyDto,
    @Param() param: ProductParamDto,
    @User() user: UserDocument,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: false })) files?: Express.Multer.File[],
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.updateAttachment(user, param.productId, body, files);
    return successResponse<ProductResponse>({ data: { product } });
  }

  @Auth(productEndPoint.create)
  @Delete(':productId/freeze')
  async freezeProduct(
    @Param() Param: ProductParamDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.productService.freeze(Param.productId, user);
    return successResponse();
  }
    
  @Auth(productEndPoint.create)
  @Patch(':productId/restore')
  async restoreProduct(
    @Param() Param: ProductParamDto,
    @User() user: UserDocument,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.restore(Param.productId, user);
    return successResponse<ProductResponse>({ data: { product } });
  }
    
  @Auth(productEndPoint.create)
  @Delete(':productId')
  async deleteProduct(
    @Param() Param: ProductParamDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.productService.delete(Param.productId, user);
    return successResponse();
  }
    
  @Get()
  async getAllProducts(@Query() query: GetAllDto): Promise<IResponse<GetAllResponse<IProduct>>> {
    const result = await this.productService.getAll(query);
    return successResponse<GetAllResponse<IProduct>>({ data: { result } });
  }
    
  @Auth(productEndPoint.create)
  @Get('/archive')
  async getAllArchivedProducts(
    @Query() query: GetAllDto
  ): Promise<IResponse<GetAllResponse<IProduct>>> {
    const result = await this.productService.getAll(query, true);
    return successResponse<GetAllResponse<IProduct>>({ data: { result } });
  }
    
  @Get(':productId')
  async getProduct(
    @Param() param: ProductParamDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.get(param.productId);
    return successResponse<ProductResponse>({ data: { product } });
  }
    
  @Auth(productEndPoint.create)
  @Get(':productId/archive')
  async getArchivedProduct(
    @Param() param: ProductParamDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.get(param.productId, true);
    return successResponse<ProductResponse>({ data: { product } });
  }

  @Auth([RoleEnum.user])
  @Patch(':productId/add-to-wishlist')
  async addProductToWishlist(
    @Param() Param: ProductParamDto,
    @User() user: UserDocument,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.addToWishlist(Param.productId, user);
    return successResponse<ProductResponse>({ data: { product } });
  }

  @Auth([RoleEnum.user])
  @Patch(':productId/remove-to-wishlist')
  async removeProductFromWishlist(
    @Param() Param: ProductParamDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.productService.removeFromWishlist(Param.productId, user);
    return successResponse();
  }
}
