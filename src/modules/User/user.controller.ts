import {
  Controller,
  Get,
  Headers,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RoleEnum, StorageEnum, successResponse } from 'src/common';
import type { IMulterFile, IUser } from 'src/common';
import type { Request } from 'express';
import { Auth, User } from 'src/common/decorators';
import type { UserDocument } from 'src/DB';
import { PreferredLanguageInterceptor } from 'src/common/interceptors';
import { delay, Observable, of } from 'rxjs';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import {
  CloudFileUpload,
  fileValidation,
  LocalFileUpload,
} from 'src/common/utils/multer';
import { IResponse } from 'src/common/interfaces/response.interface';
import { ProfileResponse } from './entities/user.entity';

//@SetMetadata('tokenType', TokenEnum.refresh)
@Controller('/user')
export class UserController {
  constructor(
    private readonly userService: UserService) { }

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

  @UseInterceptors(
    FileInterceptor(
      'profileImage',
      CloudFileUpload({
        storageApproach: StorageEnum.disk,
        validation: fileValidation.image,
      }),
    ),
  )
  @Auth([RoleEnum.user])
  @Patch('profile-image')
  async profileImage(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @User()
    user: UserDocument,
  ): Promise<IResponse<ProfileResponse>> {
    const profile = await this.userService.profileImage(file, user);
    return successResponse<ProfileResponse>({ data: { profile } });
  }

  @UseInterceptors(
    FilesInterceptor(
      'coverImages',
      3,
      LocalFileUpload({ folder: 'User', validation: fileValidation.image }),
    ),
  )
  @Auth([RoleEnum.user])
  @Patch('cover-images')
  coverImages(
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
      }),
    )
    files: Array<IMulterFile>,
  ) {
    return { message: 'Done', files };
  }

  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profile', maxCount: 1 },
        { name: 'cover', maxCount: 3 },
      ],
      LocalFileUpload({ folder: 'User', validation: fileValidation.image }),
    ),
  )
  @Auth([RoleEnum.user])
  @Patch('fields')
  image(
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: true,
        //validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
      }),
    )
    files: {
      profile: IMulterFile;
      cover: Array<IMulterFile>;
    },
  ) {
    return { message: 'Done', files };
  }
}
