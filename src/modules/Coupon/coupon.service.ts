import { BadRequestException, Injectable } from "@nestjs/common";
import { type CouponDocument, CouponRepository, UserDocument } from "src/DB";
import { FolderEnum, S3Service } from "src/common";
import { CouponBodyDto } from "./Dto/coupon.dto";

@Injectable()
export class CouponService {
    constructor(private readonly couponRepository: CouponRepository,
        private readonly s3Service: S3Service
    ) { }
    
    async create(
        body: CouponBodyDto,
        file: Express.Multer.File,
        user: UserDocument,
    ): Promise<CouponDocument> {

        const checkDuplicated = await this.couponRepository.findOne({
            filter: {
                name: body.name,
                paranoid: false,
            }
        })
        if (checkDuplicated) {
            throw new BadRequestException("Duplicated coupon name");
        }
        const image: string = await this.s3Service.uploadFile({ file, path: FolderEnum.Coupon })
        const [coupon] = await this.couponRepository.create({
            data: [{
                ...body,
                createdBy: user._id,
                image,
           }]
        })
        if (!coupon) {
            await this.s3Service.deleteFile({ Key: image });
            throw new BadRequestException("Fail to create coupon");
        }
        return coupon;
    }

}