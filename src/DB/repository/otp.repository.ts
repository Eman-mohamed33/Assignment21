import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OtpDocument as TDocument, Otp } from '../models';
import { Model } from 'mongoose';
import { DatabaseRepository } from './db.repository';

@Injectable()
export class OtpRepository extends DatabaseRepository <Otp>{
    constructor(@InjectModel(Otp.name) protected override readonly model: Model<TDocument>) {
        super(model);
    }

}