import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { preAuth } from 'src/common';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService],
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
