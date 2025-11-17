import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthenticationModule } from "./modules/Authentication/auth.module";
import { ConfigModule } from "@nestjs/config";
import { join, resolve } from "path";
import { UserModule } from "./modules/User/user.module";
import { MongooseModule } from "@nestjs/mongoose";
import { SharedAuthenticationModule } from "./common/modules/auth.module";
import { S3Service } from "./common";
import { BrandModule } from "./modules/Brand/brand.module";
import { CategoryModule } from "./modules/Category/category.module";
import { ProductModule } from "./modules/Product/product.module";
import { CartModule } from "./modules/Cart/cart.module";
import { OrderModule } from "./modules/Order/order.module";
import { CouponModule } from "./modules/Coupon/coupon.module";
import { RealtimeModule } from "./modules/Gateway/gateway.module";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
//import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve("./config/.env.development"),
    }),
    // CacheModule.register({
    //   isGlobal: true,
    //   ttl: 5000,
    // }),
    MongooseModule.forRoot(process.env.DB_URI as string, {
      serverSelectionTimeoutMS: 30000,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      graphiql: true,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
    }),
    SharedAuthenticationModule,
    AuthenticationModule,
    UserModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    CartModule,
    OrderModule,
    CouponModule,
    RealtimeModule,
  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
export class AppModule {}
