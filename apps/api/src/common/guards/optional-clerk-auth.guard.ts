import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { ClerkAuthGuard } from './clerk-auth.guard';

@Injectable()
export class OptionalClerkAuthGuard implements CanActivate {
  constructor(private readonly clerkAuthGuard: ClerkAuthGuard) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.headers.authorization) return true;
    return this.clerkAuthGuard.canActivate(context);
  }
}
