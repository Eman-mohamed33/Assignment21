import { Injectable, Req } from '@nestjs/common';
import type { Request } from 'express';
import { IUser } from 'src/common';
import { User } from 'src/common/decorators';
import type { UserDocument } from 'src/DB';

@Injectable()
export class UserService {
  constructor() {}

  getAllUsers(): IUser[] {
    return [{ id: 10, username: 'em', password: 'hdjh', email: 'gghghhg' }];
  }

  profile(
    @Req()
    req: Request,
  ) {
    console.log({
      lang: req.headers['accept-language'],
    });
    return 'Done';
  }

  profile22(
    @User()
    user: UserDocument,
  ) {
    console.log({ user });
    return 'Done';
  }
}
