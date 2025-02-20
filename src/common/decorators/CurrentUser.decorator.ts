import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { TokenPayload } from '../types/token.type';

const GetUserParam = (field?: keyof TokenPayload) => createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req: { user: TokenPayload } = context.switchToHttp().getRequest();
    if (field) return req.user[field];
    return req.user;
  },
);
export const GetCurrentUser = GetUserParam();
export const GetCurrentUserId = GetUserParam('sub');
