import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { tokenName } from 'src/common/decorators';
import { TokenEnum } from 'src/common/enums';
import { TokenService } from 'src/common/services/token.service';
import { getSocketAuth } from 'src/common/utils';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService,
    private readonly reflector:Reflector,
  ){}
  async canActivate(
    context: ExecutionContext,
  ):Promise<boolean> {
    console.log({ context });

    const tokenType: TokenEnum = this.reflector.getAllAndOverride<TokenEnum>(
      tokenName,
      [context.getHandler()]
    )
    let req: any;
    let authorization: string = '';
    switch (context.getType<string>()) {
      case 'http':
        const ctx = context.switchToHttp();
        req = ctx.getRequest();
        authorization = req.headers.authorization;
        break;
      case 'rpc':
        break;
      case 'ws':
        const ws_context = context.switchToWs();
        req = ws_context.getClient();
        authorization = getSocketAuth(req);
        break; 
      case 'graphql':
        req = GqlExecutionContext.create(context).getContext().req
        authorization = req.headers.authorization;
        
        break;
      default:
        break;
    }
    if (!authorization) {
      return false;
    }
    const { user, decoded } = await this.tokenService.decodeToken({
      authorization,
      tokenType,
    });

    req.credentials = { user, decoded };
    return true;
  }
}
