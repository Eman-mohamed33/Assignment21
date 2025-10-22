import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleEnum, TokenEnum } from '../enums';
import { Roles } from './role.type.decorators';
import { Token } from './token.type.decorator';
import { AuthorizationGuard } from '../guards/authorization/authorization.guard';
import { AuthenticationGuard } from '../guards/authentication/authentication.guard';

export function Auth(accessRoles:RoleEnum[],type:TokenEnum=TokenEnum.access) {
    return applyDecorators(
        Roles(accessRoles),
        Token(type),
        UseGuards(AuthenticationGuard, AuthorizationGuard),
    );
}
