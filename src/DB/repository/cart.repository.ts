import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CartDocument as TDocument, Cart } from '../models';
import { Model } from 'mongoose';
import { DatabaseRepository } from './db.repository';

@Injectable()
export class CartRepository extends DatabaseRepository <Cart>{
    constructor(
        @InjectModel(Cart.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}