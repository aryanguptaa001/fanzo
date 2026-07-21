import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { User } from '@fanzo/database';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async synchronize(clerkUserId: string): Promise<User> {
    const clerk = createClerkClient({
      secretKey: this.configService.getOrThrow<string>('CLERK_SECRET_KEY'),
    });
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const email =
      clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new UnauthorizedException('Clerk user does not have an email address');
    }

    const displayName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      clerkUser.username ||
      null;
    const user = await this.prisma.user.upsert({
      where: { clerkUserId },
      create: { clerkUserId, email, displayName, imageUrl: clerkUser.imageUrl },
      update: { email, displayName, imageUrl: clerkUser.imageUrl, deletedAt: null },
    });

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }
    return user;
  }
}
