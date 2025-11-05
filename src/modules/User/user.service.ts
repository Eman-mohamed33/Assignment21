import { Injectable } from '@nestjs/common';
import { S3Service, StorageEnum } from 'src/common';
import  { type UserDocument, UserRepository } from 'src/DB';
import { lean } from 'src/DB/repository/db.repository';

@Injectable()
export class UserService {
  constructor(
     private readonly userRepository: UserRepository,
    private readonly s3Service: S3Service,
  ) { }

  async profile(user: UserDocument): Promise<UserDocument | lean<UserDocument>> {
    return await this.userRepository.findOne({
      filter: { _id: user._id },
      options: {
        populate: [
          {
            path:"wishlist"
          }
        ]
      }
    }) as UserDocument;
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
