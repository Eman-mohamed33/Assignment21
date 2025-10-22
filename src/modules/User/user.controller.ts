import {
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { IUser, RoleEnum } from 'src/common';
import type { Request } from 'express';
import { Auth, User } from 'src/common/decorators';
import type { UserDocument } from 'src/DB';
import { PreferredLanguageInterceptor } from 'src/common/interceptors';
import { delay, Observable, of } from 'rxjs';

//@SetMetadata('tokenType', TokenEnum.refresh)
@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  getAllUsers(): { message: string; data: { users: IUser[] } } {
    const users = this.userService.getAllUsers();
    return { message: 'Done', data: { users } };
  }

  @Get('/profile')
  profile(
    @Req()
    req: Request,
  ): { message: string } {
    this.userService.profile(req);
    return { message: 'Done' };
  }

  @Auth([RoleEnum.user])
  @Get('/profile2')
  @UseInterceptors(PreferredLanguageInterceptor)
  profile2(
    @Headers() headers: any,
    @User()
    user: UserDocument,
  ): Observable<any> {
    this.userService.profile22(user);
    console.log(headers['accept-language']);
    return of([{ message: 'Done' }]).pipe(delay(2000));
  }
}
