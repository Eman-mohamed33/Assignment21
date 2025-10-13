import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument as TDocument} from '../models';
import { Model } from 'mongoose';
import { DatabaseRepository } from './db.repository';

@Injectable()
export class UserRepository extends DatabaseRepository <TDocument>{
    constructor(@InjectModel(User.name) protected override readonly model: Model<TDocument>) {
        super(model);
    }

}