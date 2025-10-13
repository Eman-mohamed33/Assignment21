import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}
  transform(value: any, metadata: ArgumentMetadata) {
    // if (value.password !== value.confirmPassword) {
    //     throw new BadRequestException("password mismatch confirmPassword");
    // }

    // value.firstName = (value.username.split(' ') || [])[0];
    // value.lastName = (value.username.split(' ') || [])[1];
    // value.Grades = Boolean(value.Grades)
    // return value;

    const { success, error } = this.schema.safeParse(value);
    if (!success) {
      throw new BadRequestException({
        message: 'validation error',
        cause: {
          issues: error.issues.map((issue) => {
            return {
              path: issue.path,
              message: issue.message,
            };
          }),
        },
      });
    }

    return value;
  }
}
