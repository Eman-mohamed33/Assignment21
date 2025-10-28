import {
  Body,
  Controller,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AuthenticationService } from './auth.service';
import {
  ConfirmEmailBodyDto,
  ForgotPasswordBodyDto,
  gmailValidation,
  LoginBodyDto,
  ResetPasswordBodyDto,
  SignupBodyDto,
} from './Dto/signup.dto';
import { LoginResponse } from './entities/auth.entity';
import { successResponse } from 'src/common';
import { IResponse } from 'src/common/interfaces/response.interface';

UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('signup')
  //@Redirect("/", 301)
  //signup(@Req() req: Request)
  async signup(
    @Body()
    body: SignupBodyDto,
  ): Promise<IResponse> {
    await this.authenticationService.signup(body);
    return successResponse();
    // console.log(req.params);
    // console.log(req.query);
    //console.log({ req });

    // console.log({ Grades });

    // 'Grades',
    // new ParseArrayPipe({
    //   items: Number,
    //   separator:","
    // })

    //   new DefaultValuePipe('user'),
    // new ParseEnumPipe(['user', 'admin'],{
    //   optional: false
    // })

    // ParseIntPipe({
    //       errorHttpStatusCode: 401,
    //       exceptionFactory(error) {
    //         throw new ConflictException({
    //           message: 'age must be integer',
    //           cause: {
    //             extra:"kks"
    //           }
    //         })
    //    }
    //  ParseIntPipe
    //  @Param() param: any,
    // @Query() query: any,
    // @Headers() headers: any,
    // @Res({ passthrough: true }) res: Response,

    // console.log({ body });
    // console.log({ param });
    // console.log({ query });
    // console.log(na);
    // console.log(headers);

    //console.log(res);

    //return res.status(201).json({message:"Done"})

    // whitelist: true,
    // forbidNonWhitelisted: true,
    // dismissDefaultMessages: true,
    // disableErrorMessages: true,
    // skipUndefinedProperties: true,
    // skipMissingProperties: true,
    // skipNullProperties:true,

    // throw new BadRequestException("dhhdjjdd");
    //  throw new HttpException("fail",500);
  }

  @Post('resend-confirm-email')
  async resendConfirmEmailOtp(
    @Body()
    body: ForgotPasswordBodyDto,
  ): Promise<IResponse> {
    await this.authenticationService.resendConfirmEmailOtp(body);
    return successResponse();
  }
  //@HttpCode(200)
  // @HttpCode(HttpStatus.OK);

  @Post('login')
  async login(
    @Body()
    body: LoginBodyDto,
  ): Promise<IResponse<LoginResponse>> {
    const credentials = await this.authenticationService.login(body);
    return successResponse<LoginResponse>({ data: { credentials } });
  }

  @Patch('confirm-Email')
  async confirmEmail(
    @Body()
    body: ConfirmEmailBodyDto,
  ): Promise<IResponse> {
    await this.authenticationService.confirmEmail(body);
    return successResponse();
  }

  @Post('forgot-password')
  async forgetPassword(
    @Body()
    body: ForgotPasswordBodyDto,
  ): Promise<IResponse> {
    await this.authenticationService.forgotPassword(body);
    return successResponse({ message: `We Sent Your Code To ${body.email} , Please Check Your Email ✅` });
  }

  @Post('verify-forgot-password')
  async verifyForgotPasswordCode(
    @Body()
    body: ConfirmEmailBodyDto,
  ): Promise<IResponse> {
    await this.authenticationService.verifyForgotPasswordCode(body);
    return successResponse();
  }

  @Post('reset-your-password')
  async resetYourPassword(
    @Body()
    body: ResetPasswordBodyDto,
  ): Promise<IResponse> {
    await this.authenticationService.resetYourPassword(body);
    return successResponse({ message: `Your Password is Reset` });
  }

  @Post('signup-with-gmail')
  async signupWithGmail(
    @Body()
    body: gmailValidation,
  ): Promise<IResponse> {
    await this.authenticationService.signupWithGmail(body);
    return successResponse();
  }

  @Post('login-with-gmail')
  async loginWithGmail(
    @Body()
    body: gmailValidation,
  ): Promise<IResponse<LoginResponse>> {
    const credentials =
      await this.authenticationService.loginWithGmail(body);
    return successResponse<LoginResponse>({ data: { credentials } });
  }

  // @UseGuards(AuthGuard)
  // @Get('profile')
  // profile(@Request() req) {
  //   return { user: req.user };
  // }
}
