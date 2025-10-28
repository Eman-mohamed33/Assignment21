import { Injectable, Req } from '@nestjs/common';
import type { Request } from 'express';
import { S3Service, StorageEnum } from 'src/common';
import { User } from 'src/common/decorators';
import type { UserDocument } from 'src/DB';

@Injectable()
export class UserService {
  constructor(private readonly s3Service:S3Service) {}

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

  async profileImage(
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<UserDocument> {
    user.profilePicture = await this.s3Service.uploadFile({
      file,
      storageApproach: StorageEnum.disk,
      path: `user/${user._id.toString()}`,
    });
    await user.save();
    return user;
  }
}
