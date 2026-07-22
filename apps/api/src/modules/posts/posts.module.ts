import { Module } from '@nestjs/common';
import { OptionalClerkAuthGuard } from '../../common/guards/optional-clerk-auth.guard';
import { MediaModule } from '../../media/media.module';
import { UsersModule } from '../users/users.module';
import { CreatorPostsController, PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [UsersModule, MediaModule],
  controllers: [PostsController, CreatorPostsController],
  providers: [PostsService, OptionalClerkAuthGuard],
  exports: [PostsService],
})
export class PostsModule {}
