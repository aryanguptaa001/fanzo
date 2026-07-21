import { Module } from '@nestjs/common';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ClerkAuthGuard],
  exports: [UsersService, ClerkAuthGuard],
})
export class UsersModule {}
