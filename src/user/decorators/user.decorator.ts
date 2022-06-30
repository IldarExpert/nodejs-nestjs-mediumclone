import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExpressRequestInterface } from '../../types/expressRequest.interface';

export const UserDecorator = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<ExpressRequestInterface>();
  if (!request.user) {
    return null;
  }
  if (data && typeof data === 'string') {
    return request.user[data as keyof typeof request.user];
  }
  return request.user;
});
