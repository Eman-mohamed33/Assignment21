import { Injectable } from '@nestjs/common';
import { IUser } from 'src/common';

@Injectable()
export class UserService {
  constructor() {}

  getAllUsers(): IUser[] {
    return [{ id: 10, username: 'em', password: 'hdjh', email: 'gghghhg' }];
  }
}
