import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
  maxLength,
  minLength,
  MinLength,
  registerDecorator,
  ValidateIf,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { GenderEnum } from 'src/common';

@ValidatorConstraint({ name: 'match-between-fields', async: false })
export class MatchBetweenFields implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    console.log({ value, args, mismatch: args.object[args.constraints[0]] });

    return value === args.object[args.constraints[0]];
  }

  defaultMessage(args: ValidationArguments): string {
    return `fail to match src field :: ${args?.property} with target field :: ${args?.constraints[0]}`;
  }
}

export function IsMatch(
  constraints: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints,
      validator: MatchBetweenFields,
    });
  };
}
export class ForgotPasswordBodyDto {
  @IsEmail()
  email: string;
}
export class LoginBodyDto extends ForgotPasswordBodyDto {
 
  @IsStrongPassword()
  password: string;
}
export class SignupBodyDto extends LoginBodyDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  username: string;

  //@Validate(MatchBetweenFields, { message: "confirm Password not identical with password" })
  @ValidateIf((data: SignupBodyDto) => {
    return Boolean(data.password);
  })
  @IsMatch(['password'], {
    //  message: 'confirm Password not identical with password'
  })
  confirmPassword: string;

  // @IsOptional()
  // age: number;
  @IsOptional()
  gender: GenderEnum;
}

export class SignupQueryDto {
  @IsString()
  @MinLength(3)
  flag: string
}

export class ConfirmEmailBodyDto extends ForgotPasswordBodyDto{

  @Length(1, 6)
  @IsString()
  otp: string;
}

export class ResetPasswordBodyDto extends LoginBodyDto {
  @Length(1, 6)
  @IsString()
  otp: string;
}

export class gmailValidation {
  @IsNotEmpty()
  @IsString()
  idToken: string;
}