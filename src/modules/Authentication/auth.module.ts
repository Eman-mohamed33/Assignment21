import { Module } from '@nestjs/common';
import { AuthenticationController } from './auth.controller';
import { AuthenticationService } from './auth.service';
import { OtpModel } from 'src/DB';
import { OtpRepository } from 'src/DB/repository/otp.repository';

@Module({
  imports: [OtpModel],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, OtpRepository],
  exports: [],
})
export class AuthenticationModule {}
