import { Global, Module } from '@nestjs/common';
import {
  TokenModel,
  TokenRepository,
  UserModel,
  UserRepository,
} from 'src/DB';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
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
  ],
  controllers: [],
  providers: [
    UserRepository,
    TokenService,
    TokenRepository,
    JwtService,
    ],
})
export class SharedAuthenticationModule { };
