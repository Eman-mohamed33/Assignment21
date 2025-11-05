import { Module } from "@nestjs/common";
import { CouponModel, CouponRepository } from "src/DB";
import { S3Service } from "src/common";
import { CouponController } from "./coupon.controller";
import { CouponService } from "./coupon.service";

@Module({
  imports: [CouponModel],
  controllers: [CouponController],
  providers: [CouponService, CouponRepository, S3Service],
  exports: [],
})
export class CouponModule {}
