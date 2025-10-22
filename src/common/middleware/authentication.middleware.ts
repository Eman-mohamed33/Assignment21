import { Request, Response, NextFunction } from 'express';
import { BadRequestException } from '@nestjs/common';

export const preAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(req.headers.authorization?.split(' ').length == 2)) {
    throw new BadRequestException('Missing authorization key ')
  }
  next();
};

// @Injectable()
// export class AuthenticationMiddle implements NestMiddleware {
//   constructor(private readonly tokenService: TokenService) { }
//   async use(req: IAuthRequest, res: Response, next: NextFunction) {
//     console.log('Request...');
//     const { user, decoded } = await this.tokenService.decodeToken({
//       authorization: req.headers.authorization ?? '',
//       tokenType: req.tokenType as TokenEnum,
//     })

//     req.credentials = { user, decoded };
//     next();
//   }
// }
