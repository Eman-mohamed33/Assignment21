import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        let req: any;
        switch (context.getType()) {
            case 'http':
                req = context.switchToHttp().getRequest();
                break;
            // case 'rpc':
            //   break;
            // case 'ws':
            //   break;
            default:
                break;
        }
        return req.credentials.user;

    },
);
