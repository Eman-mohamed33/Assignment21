import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BrandDocument as TDocument, Brand } from '../models';
import { Model } from 'mongoose';
import { DatabaseRepository } from './db.repository';

@Injectable()
export class BrandRepository extends DatabaseRepository <Brand>{
    constructor(
        @InjectModel(Brand.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}