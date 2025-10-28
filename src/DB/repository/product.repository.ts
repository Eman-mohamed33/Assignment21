import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProductDocument as TDocument, Product } from '../models';
import { Model } from 'mongoose';
import { DatabaseRepository } from './db.repository';

@Injectable()
export class ProductRepository extends DatabaseRepository <Product>{
    constructor(
        @InjectModel(Product.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}