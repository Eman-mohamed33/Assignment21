import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthenticationModule } from "./modules/Authentication/auth.module";
import { ConfigModule } from "@nestjs/config";
import { resolve } from "path";
import { UserModule } from "./modules/User/user.module";
import { MongooseModule } from "@nestjs/mongoose";
import { SharedAuthenticationModule } from "./common/modules/auth.module";
import { S3Service } from "./common";
import { BrandModule } from "./modules/Brand/brand.module";
import { CategoryModule } from "./modules/Category/category.module";
import { ProductModule } from "./modules/Product/product.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve("./config/.env.development"),
    }),
    MongooseModule.forRoot(process.env.DB_URI as string, {
      serverSelectionTimeoutMS: 30000,
    }),
    SharedAuthenticationModule,
    AuthenticationModule,
    UserModule,
    BrandModule,
    CategoryModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
export class AppModule {}
