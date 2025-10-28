import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { preAuth, S3Service } from 'src/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Request } from 'express';
import { randomUUID } from 'crypto';

@Module({
  imports: [
    // MulterModule.register({
    //   storage: diskStorage({
    //     destination(req: Request, file: Express.Multer.File, callback) {
    //       callback(null, './uploads');
    //     },

    //     filename(req: Request, file: Express.Multer.File, callback) {
    //       const fileName =
    //         randomUUID() + '_' + Date.now() + '_' + file.originalname;
    //       callback(null, fileName);
    //     },
    //   }),
    // }),
  ],
  controllers: [UserController],
  providers: [UserService, S3Service],
  exports: [],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(preAuth).forRoutes(UserController);
  }
  //   // consumer
  //   //   .apply(authorization)
  //   //   .exclude({ path: 'user/profile', method: RequestMethod.GET })
  //   //   .forRoutes({ path: 'user/profile2', method: RequestMethod.GET });
  // }
}
