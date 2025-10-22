import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  compareHash,
  generateHash,
  generateOtp,
  IUser,
  ProviderEnum,
} from 'src/common';
import { UserDocument, UserRepository } from 'src/DB';
import {
  ConfirmEmailBodyDto,
  ForgotPasswordBodyDto,
  gmailValidation,
  LoginBodyDto,
  ResetPasswordBodyDto,
  SignupBodyDto,
} from './Dto/signup.dto';
import { emailEvent } from 'src/common/utils/events/email.event';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { OtpRepository } from 'src/DB/repository/otp.repository';
import { OtpEnum } from 'src/common/enums/otp.enum';
import { Types } from 'mongoose';
import { LoginCredentialsResponse } from 'src/common/entities';
import { TokenService } from 'src/common/services/token.service';

@Injectable()
export class AuthenticationService {
  private users: IUser[] = [];
  private async verifyGmailAccount(idToken: string): Promise<TokenPayload> {
    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_IDs?.split(',') || [],
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      throw new BadRequestException('Fail to verify this google Account');
    }
    return payload;
  }
  private async createConfirmEmailOtp(userId: Types.ObjectId) {
    await this.otpModel.create({
      data: [
        {
          code: String(generateOtp()),
          createdBy: userId,
          type: OtpEnum.confirm_email,
          expiredAt: new Date(Date.now() + 2 * 60 * 1000),
        },
      ],
    });
  }
  constructor(
    private userModel: UserRepository,
    private tokenService: TokenService,
    private otpModel: OtpRepository,
  ) {}

  async signup(data: SignupBodyDto): Promise<string> {
    const { username, password, email, gender } = data;
    const checkUserExist = await this.userModel.findOne({
      filter: { email },
    });
    if (checkUserExist) {
      throw new ConflictException('User already exist');
    }

    const [user] = await this.userModel.create({
      data: [
        {
          username,
          password,
          email,
          gender,
        },
      ],
    });
    if (!user) {
      throw new BadRequestException('Fail to signup this account');
    }

    await this.createConfirmEmailOtp(user._id);
    return 'Done';
  }

  async login(data: LoginBodyDto): Promise<LoginCredentialsResponse> {
    const { email, password } = data;
    const userExist = await this.userModel.findOne({
      filter: { email },
    });

    if (!userExist) {
      throw new NotFoundException('fail to find matching account');
    }

    if (!userExist.confirmEmail) {
      throw new BadRequestException('please verify your account first');
    }

    if (!(await compareHash(password, userExist.password))) {
      throw new BadRequestException('invalid login data');
    }
    return await this.tokenService.createLoginCredentials(
      userExist as UserDocument,
    );
  }

  async resendConfirmEmailOtp(data: ForgotPasswordBodyDto): Promise<string> {
    const { email } = data;
    const user = await this.userModel.findOne({
      filter: { email, confirmEmail: { $exists: false } },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.confirm_email } }],
      },
    });
    if (!user) {
      throw new NotFoundException('fail to find matching result');
    }

    if (user.otp?.length) {
      throw new ConflictException(
        `Sorry we cannot grant you new otp until the existing one become expired please try again after:${user.otp[0].expiredAt}`,
      );
    }
    await this.createConfirmEmailOtp(user._id);
    return 'Done';
  }
  async confirmEmail(data: ConfirmEmailBodyDto): Promise<string> {
    const { email, otp } = data;

    const user = await this.userModel.findOne({
      filter: {
        email,
        confirmEmail: { $exists: false },
      },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.confirm_email } }],
      },
    });
    if (!user) {
      throw new NotFoundException('user not exist or already email confirmed');
    }

    if (!(user.otp?.length && (await compareHash(otp, user.otp[0].code)))) {
      throw new BadRequestException('invalid otp');
    }

    user.confirmEmail = new Date();
    await user.save();

    await this.otpModel.deleteOne({ filter: { _id: user.otp[0]._id } });
    return 'Done';
  }

  async forgotPassword(data: ForgotPasswordBodyDto): Promise<string> {
    const { email } = data;

    const user = await this.userModel.findOne({
      filter: {
        email,
        provider: ProviderEnum.system,
        confirmEmail: { $exists: true },
      },
    });

    if (!user) {
      throw new NotFoundException(
        'In-valid Account due to one of the following reasons [not register ,not confirmed ,invalid provider]',
      );
    }

    const otp = generateOtp();

    const User = await this.userModel.updateOne({
      filter: { email },
      update: {
        resetPasswordOtp: await generateHash(String(otp)),
      },
    });
    if (!User.matchedCount) {
      throw new BadRequestException(
        'Fail to send the reset code please try again later',
      );
    }

    emailEvent.emit('SendForgotPasswordCode', { to: email, otp });
    return 'Done';
  }

  async verifyForgotPasswordCode(data: ConfirmEmailBodyDto): Promise<string> {
    const { email, otp } = data;

    const user = await this.userModel.findOne({
      filter: {
        email,
        provider: ProviderEnum.system,
        resetPasswordOtp: { $exists: true },
      },
    });

    if (!user) {
      throw new NotFoundException(
        'In-valid Account due to one of the following reasons [not register ,not confirmed ,invalid provider]',
      );
    }

    if (!(await compareHash(otp, user.resetPasswordOtp))) {
      throw new NotFoundException('Invalid Otp');
    }

    return 'Done';
  }

  async resetYourPassword(data: ResetPasswordBodyDto): Promise<string> {
    const { email, otp, password } = data;

    const user = await this.userModel.findOne({
      filter: {
        email,
        provider: ProviderEnum.system,
        resetPasswordOtp: { $exists: true },
      },
    });

    if (!user) {
      throw new NotFoundException(
        'In-valid Account due to one of the following reasons [not register ,not confirmed ,invalid provider]',
      );
    }

    if (!(await compareHash(otp, user.resetPasswordOtp))) {
      throw new NotFoundException('Invalid Otp');
    }
    const updatedUser = await this.userModel.updateOne({
      filter: { email },
      update: {
        password: await generateHash(password),
        $unset: { resetPasswordOtp: 1 },
        changeCredentialsTime: new Date(),
      },
    });

    if (!updatedUser.matchedCount) {
      throw new BadRequestException(
        'Fail to reset password please try again later',
      );
    }

    return 'Done';
  }

  async loginWithGmail(
    data: gmailValidation,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const { idToken } = data;
    const { email } = await this.verifyGmailAccount(idToken);
    const user = await this.userModel.findOne({
      filter: { email, provider: ProviderEnum.google },
    });
    if (!user) {
      throw new NotFoundException('User Not Exist');
    }
    return await this.tokenService.createLoginCredentials(user as UserDocument);
  }

  async signupWithGmail(data: gmailValidation): Promise<string> {
    const { idToken } = data;
    const { email, family_name, given_name } =
      await this.verifyGmailAccount(idToken);
    const checkUserExist = await this.userModel.findOne({
      filter: { email },
    });
    if (checkUserExist) {
      if (checkUserExist.provider === ProviderEnum.google) {
        await this.loginWithGmail(data);
      }
      throw new ConflictException('User already Exist');
    }

    const user = await this.userModel.create({
      data: [
        {
          firstName: given_name as string,
          lastName: family_name as string,
          email: email as string,
          confirmEmail: new Date(),
          provider: ProviderEnum.google,
        },
      ],
    });

    if (!user) {
      throw new BadRequestException(
        'Fail to signup with gmail please try again...',
      );
    }
    return 'Done';
  }
}
