import { Body, Controller, Delete, Get, Param, ParseFilePipe, Patch, Post, Query, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudFileUpload, fileValidation } from "src/common/utils/multer";
import { Auth, User } from "src/common/decorators";
import type { UserDocument } from "src/DB";
import { IResponse } from "src/common/interfaces/response.interface";
import { successResponse } from "src/common";
import { categoryEndPoint } from "./category.authorization";
import { CategoryResponse, GetAllCategoriesResponse } from "./entities/category.entity";
import { CategoryBodyDto, CategoryParamsDto, GetAllDtoCategory, UpdateCategoryBodyDto } from "./Dto/category.dto";

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }
  
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      CloudFileUpload({
        validation: fileValidation.image,
      })))
  @Auth(categoryEndPoint.create)
  @Post()
  async createCategory(
    @Body() body: CategoryBodyDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.create(body, file, user);
    return successResponse<CategoryResponse>({ status: 201, data: { category } });
  }
     

  @Auth(categoryEndPoint.create)
  @Patch(':categoryId')
  async updateCategory(
    @Param() Param: CategoryParamsDto,
    @Body() Body: UpdateCategoryBodyDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.update(Param.categoryId, Body, user);
    return successResponse<CategoryResponse>({ data: { category } });
  }
  

  @UseInterceptors(FileInterceptor("attachment", CloudFileUpload({
    validation: fileValidation.image,
  })))
  @Auth(categoryEndPoint.create)
  @Patch(':categoryId/attachment')
  async updateCategoryAttachment(
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @Param() Param: CategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.updateAttachment(Param.categoryId, user, file);
    return successResponse<CategoryResponse>({ data: { category } });
  }

  @Auth(categoryEndPoint.create)
  @Delete(':categoryId/freeze')
  async freezeCategory(
    @Param() Param: CategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.categoryService.freeze(Param.categoryId, user);
    return successResponse();
  }
  
  @Auth(categoryEndPoint.create)
  @Patch(':categoryId/restore')
  async restoreCategory(
    @Param() Param: CategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.restore(Param.categoryId, user);
    return successResponse<CategoryResponse>({ data: { category } });
  }
  
    
  @Auth(categoryEndPoint.create)
  @Delete(':categoryId')
  async deleteCategory(
    @Param() Param: CategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.categoryService.delete(Param.categoryId, user);
    return successResponse();
  }
  
  @Get()
  async getAllCategories(@Query() query: GetAllDtoCategory): Promise<IResponse<GetAllCategoriesResponse>> {
    const categories = await this.categoryService.getAll(query);
    return successResponse<GetAllCategoriesResponse>({ data: { categories } });
  }
  
  @Auth(categoryEndPoint.create)
  @Get('/archive')
  async getAllArchivedCategories(
    @Query() query: GetAllDtoCategory
  ): Promise<IResponse<GetAllCategoriesResponse>> {
    const categories = await this.categoryService.getAll(query, true);
    return successResponse<GetAllCategoriesResponse>({ data: { categories } });
  }
  
  @Get(':categoryId')
  async getCategory(
    @Param() param: CategoryParamsDto,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.get(param.categoryId);
    return successResponse<CategoryResponse>({ data: { category } });
  }
  
  @Auth(categoryEndPoint.create)
  @Get(':categoryId/archive')
  async getArchivedCategory(
    @Param() param: CategoryParamsDto,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.get(param.categoryId, true);
    return successResponse<CategoryResponse>({ data: { category } });
  }
  
}
