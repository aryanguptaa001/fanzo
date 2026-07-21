import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { User } from '@fanzo/database';
import type { AuthenticatedRequest } from './authenticated-request.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
