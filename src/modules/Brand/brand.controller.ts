import { Body, Controller, Delete, Get, Param, ParseFilePipe, Patch, Post, Query, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { BrandService } from "./brand.service";
import { Auth, User } from "src/common/decorators";
import { IBrand, successResponse } from "src/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudFileUpload, fileValidation } from "src/common/utils/multer";
import { BrandResponse } from "./entities/brand.entity";
import { IResponse } from "src/common/interfaces/response.interface";
import type { UserDocument } from "src/DB";
import { BrandBodyDto, BrandParamsDto, UpdateBodyDto } from "./Dto/brand.dto";
import { BrandEndPoint } from "./brand.authorization";
import { GetAllDto } from "src/common/dtos";
import { GetAllResponse } from "src/common/entities";

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('brand')
export class BrandController {
    constructor(private readonly brandService: BrandService) { }
    @UseInterceptors(
        FileInterceptor(
            'attachment',
            CloudFileUpload({
                validation: fileValidation.image,
            })))
    @Auth(BrandEndPoint.create)
    @Post()
     async createBrand(
         @Body() body: BrandBodyDto,
         @UploadedFile(ParseFilePipe) file: Express.Multer.File,
         @User() user: UserDocument,
     ) :Promise<IResponse<BrandResponse>>{
         const brand = await this.brandService.create(body, file, user);
         return successResponse<BrandResponse>({ status: 201, data: { brand } });
    }
   
    @Auth(BrandEndPoint.create)
    @Patch(':brandId')
    async updateBrand(
        @Param() Param: BrandParamsDto,
        @Body() Body: UpdateBodyDto,
        @User() user: UserDocument,
    ): Promise<IResponse<BrandResponse>> {
        const brand = await this.brandService.update(Param.brandId, Body, user);
        return successResponse<BrandResponse>({ data: { brand } });
    }

    @UseInterceptors(FileInterceptor("attachment", CloudFileUpload({
        validation: fileValidation.image,
    })))
     @Auth(BrandEndPoint.create)
    @Patch(':brandId/attachment')
    async updateBrandAttachment(
        @UploadedFile(ParseFilePipe) file: Express.Multer.File,
        @Param() Param: BrandParamsDto,
        @User() user: UserDocument,
    ): Promise<IResponse<BrandResponse>> {
        const brand = await this.brandService.updateAttachment(Param.brandId, user, file);
        return successResponse<BrandResponse>({ data: { brand } });
    }


    @Auth(BrandEndPoint.create)
    @Delete(':brandId/freeze')
    async freezeBrand(
        @Param() Param: BrandParamsDto,
        @User() user: UserDocument,
    ): Promise<IResponse> {
        await this.brandService.freeze(Param.brandId, user);
        return successResponse();
    }

    @Auth(BrandEndPoint.create)
    @Patch(':brandId/restore')
    async restoreBrand(
        @Param() Param: BrandParamsDto,
        @User() user: UserDocument,
    ): Promise<IResponse<BrandResponse>> {
        const brand = await this.brandService.restore(Param.brandId, user);
        return successResponse<BrandResponse>({ data: { brand } });
    }


    
    @Auth(BrandEndPoint.create)
    @Delete(':brandId')
    async deleteBrand(
        @Param() Param: BrandParamsDto,
        @User() user: UserDocument,
    ): Promise<IResponse> {
        await this.brandService.delete(Param.brandId, user);
        return successResponse();
    }

    @Get()
    async getAllBrands(@Query() query: GetAllDto): Promise<IResponse<GetAllResponse<IBrand>>> {
        const result = await this.brandService.getAll(query);
        return successResponse<GetAllResponse<IBrand>>({ data: { result } });
    }

    @Auth(BrandEndPoint.create)
    @Get('/archive')
    async getAllArchivedBrands(
        @Query() query: GetAllDto
    ): Promise<IResponse<GetAllResponse<IBrand>>> {
        const result = await this.brandService.getAll(query, true);
        return successResponse<GetAllResponse<IBrand>>({ data: { result } });
    }

    @Get(':brandId')
    async getBrand(
        @Param() param: BrandParamsDto,
    ): Promise<IResponse<BrandResponse>> {
        const brand = await this.brandService.get(param.brandId);
        return successResponse<BrandResponse>({ data: { brand } });
    }

     @Auth(BrandEndPoint.create)
    @Get(':brandId/archive')
    async getArchivedBrand(
        @Param() param: BrandParamsDto,
    ): Promise<IResponse<BrandResponse>> {
         const brand = await this.brandService.get(param.brandId, true);
        return successResponse<BrandResponse>({ data: { brand } });
    }

}
