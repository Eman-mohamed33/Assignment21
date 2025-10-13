import { Module } from '@nestjs/common';
import { AuthenticationController } from './auth.controller';
import { AuthenticationService } from './auth.service';
import { UserModel, UserRepository } from 'src/DB';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    UserModel,
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_USER_TOKEN_SIGNATURE || 'hhd',
      signOptions: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) || 3600,
      },
    }),
  ],
  exports: [AuthenticationService],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, UserRepository, AuthGuard],
})
export class AuthenticationModule {}
