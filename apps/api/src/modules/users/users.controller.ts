import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { User } from '@fanzo/database';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @Get('me')
  @UseGuards(ClerkAuthGuard)
  @ApiOkResponse({ description: 'The authenticated Fanzo user' })
  me(@CurrentUser() user: User) {
    return {
      id: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      displayName: user.displayName,
      imageUrl: user.imageUrl,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
