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
  ): Promise<{ message: string }> {
    await this.authenticationService.signup(body);
    return { message: 'Done' };
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
  ): Promise<{ message: string }> {
    await this.authenticationService.resendConfirmEmailOtp(body);
    return { message: 'Done' };
  }
  //@HttpCode(200)
  // @HttpCode(HttpStatus.OK);

  @Post('login')
  async login(
    @Body()
    body: LoginBodyDto,
  ): Promise<LoginResponse> {
    const credentials = await this.authenticationService.login(body);
    return { message: 'Done', data: { credentials } };
  }

  @Patch('confirm-Email')
  async confirmEmail(
    @Body()
    body: ConfirmEmailBodyDto,
  ): Promise<{ message: string }> {
    await this.authenticationService.confirmEmail(body);
    return { message: 'Done' };
  }

  @Post('forgot-password')
  async forgetPassword(
    @Body()
    body: ForgotPasswordBodyDto,
  ): Promise<string> {
    await this.authenticationService.forgotPassword(body);
    return `We Sent Your Code To ${body.email} , Please Check Your Email ✅`;
  }

  @Post('verify-forgot-password')
  async verifyForgotPasswordCode(
    @Body()
    body: ConfirmEmailBodyDto,
  ): Promise<string> {
    await this.authenticationService.verifyForgotPasswordCode(body);
    return 'Done';
  }

  @Post('reset-your-password')
  async resetYourPassword(
    @Body()
    body: ResetPasswordBodyDto,
  ): Promise<string> {
    await this.authenticationService.resetYourPassword(body);
    return `Your Password is Reset`;
  }

  @Post('signup-with-gmail')
  async signupWithGmail(
    @Body()
    body: gmailValidation,
  ): Promise<string> {
    await this.authenticationService.signupWithGmail(body);
    return 'Done';
  }

  @Post('login-with-gmail')
  async loginWithGmail(
    @Body()
    body: gmailValidation,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const { access_token, refresh_token } =
      await this.authenticationService.loginWithGmail(body);
    return { access_token, refresh_token };
  }

  // @UseGuards(AuthGuard)
  // @Get('profile')
  // profile(@Request() req) {
  //   return { user: req.user };
  // }
}
