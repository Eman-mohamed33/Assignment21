import { Body, Controller, ParseFilePipe, Post, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { Auth, User } from "src/common/decorators";
import { RoleEnum, successResponse } from "src/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudFileUpload, fileValidation } from "src/common/utils/multer";
import { IResponse } from "src/common/interfaces/response.interface";
import type { UserDocument } from "src/DB";
import { CouponService } from "./coupon.service";
import { CouponBodyDto } from "./Dto/coupon.dto";
import { CouponResponse } from "./entities/coupon.entity";

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('coupon')
export class CouponController {
    constructor(private readonly couponService: CouponService) { }
    @UseInterceptors(
        FileInterceptor(
            'attachment',
            CloudFileUpload({
                validation: fileValidation.image,
            })))
    @Auth([RoleEnum.admin, RoleEnum.superAdmin])
    @Post()
    async createCoupon(
        @Body() body: CouponBodyDto,
        @UploadedFile(ParseFilePipe) file: Express.Multer.File,
        @User() user: UserDocument,
    ): Promise<IResponse<CouponResponse>> {
        const coupon = await this.couponService.create(body, file, user);
        return successResponse<CouponResponse>({ status: 201, data: { coupon } });
    }
   
    
}
