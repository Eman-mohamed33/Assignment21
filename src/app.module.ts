import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationController } from './modules/Authentication/auth.controller';
import { AuthenticationModule } from './modules/Authentication/auth.module';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { UserModule } from './modules/User/user.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.development'),
    }),
    MongooseModule.forRoot(process.env.DB_URI as string, {
      serverSelectionTimeoutMS: 30000,
    }),
    AuthenticationModule,
    UserModule,
    CategoryModule,
    ProductModule,
  ],
  controllers: [AppController, AuthenticationController],
  providers: [AppService],
})
export class AppModule {}
