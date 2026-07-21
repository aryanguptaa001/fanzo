import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import type { Request } from 'express';
import { UsersService } from '../../modules/users/users.service';
import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.readBearerToken(request.headers.authorization);

    try {
      const authorizedParties = this.configService
        .get<string>('CLERK_AUTHORIZED_PARTIES', this.configService.getOrThrow<string>('WEB_URL'))
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      const payload = await verifyToken(token, {
        secretKey: this.configService.getOrThrow<string>('CLERK_SECRET_KEY'),
        jwtKey: this.configService.get<string>('CLERK_JWT_KEY'),
        authorizedParties,
      });
      const user = await this.usersService.synchronize(payload.sub);
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.clerkUserId = payload.sub;
      authenticatedRequest.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  private readBearerToken(header?: string): string {
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('A bearer token is required');
    }
    return header.slice('Bearer '.length).trim();
  }
}
