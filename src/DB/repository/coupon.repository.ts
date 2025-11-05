import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CouponDocument as TDocument, Coupon } from '../models';
import { Model } from 'mongoose';
import { DatabaseRepository } from './db.repository';

@Injectable()
export class CouponRepository extends DatabaseRepository <Coupon>{
    constructor(
        @InjectModel(Coupon.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}