import { Global, Module } from '@nestjs/common';
import {
  TokenModel,
  TokenRepository,
  UserModel,
  UserRepository,
} from 'src/DB';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { createClient } from "redis";
import { Redis } from '@upstash/redis';
@Global()
@Module({
  imports: [UserModel, TokenModel],
  exports: [
    UserRepository,
    TokenService,
    TokenRepository,
    JwtService,
    UserModel,
    TokenModel,
    "REDIS_CLIENT",
  ],
  controllers: [],
  providers: [
    UserRepository,
    TokenService,
    TokenRepository,
    JwtService,
    {
      provide: "REDIS_CLIENT",
      useFactory: () => {
        const client = new Redis({
          url: process.env.UPSTASH_REDIS_URL, // or your VPS URL,
          token: process.env.UPSTASH_REDIS_TOKEN,
        });
        console.log("✅ Redis connected");

        return client;
      },
    },
  ],
})
export class SharedAuthenticationModule {};
