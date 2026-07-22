import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { User } from '@fanzo/database';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { OptionalClerkAuthGuard } from '../../common/guards/optional-clerk-auth.guard';
import { MAX_MEDIA_PER_POST, MAX_VIDEO_BYTES } from '../../media/media-storage.constants';
import { CreatePostDto } from './dto/create-post.dto';
import { PostPaginationDto } from './dto/post-pagination.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(ClerkAuthGuard)
  create(@CurrentUser() user: User, @Body() dto: CreatePostDto) {
    return this.posts.create(user, dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(ClerkAuthGuard)
  listMine(@CurrentUser() user: User, @Query() pagination: PostPaginationDto) {
    return this.posts.listMine(user, pagination);
  }

  @Get('me/:postId')
  @ApiBearerAuth()
  @UseGuards(ClerkAuthGuard)
  getMine(@CurrentUser() user: User, @Param('postId') postId: string) {
    return this.posts.getOwnedPost(user, postId);
  }

  @Post(':postId/media')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(ClerkAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', MAX_MEDIA_PER_POST, { limits: { fileSize: MAX_VIDEO_BYTES } }),
  )
  upload(
    @CurrentUser() user: User,
    @Param('postId') postId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.posts.uploadMedia(user, postId, files ?? []);
  }

  @Patch(':postId')
  @ApiBearerAuth()
  @UseGuards(ClerkAuthGuard)
  update(@CurrentUser() user: User, @Param('postId') postId: string, @Body() dto: UpdatePostDto) {
    return this.posts.update(user, postId, dto);
  }

  @Post(':postId/publish')
  @ApiBearerAuth()
  @UseGuards(ClerkAuthGuard)
  publish(@CurrentUser() user: User, @Param('postId') postId: string) {
    return this.posts.publish(user, postId);
  }

  @Post(':postId/unpublish')
  @ApiBearerAuth()
  @UseGuards(ClerkAuthGuard)
  unpublish(@CurrentUser() user: User, @Param('postId') postId: string) {
    return this.posts.unpublish(user, postId);
  }

  @Delete(':postId/media/:mediaId')
  @ApiBearerAuth()
  @UseGuards(ClerkAuthGuard)
  removeMedia(
    @CurrentUser() user: User,
    @Param('postId') postId: string,
    @Param('mediaId') mediaId: string,
  ) {
    return this.posts.removeMedia(user, postId, mediaId);
  }

  @Delete(':postId')
  @ApiBearerAuth()
  @UseGuards(ClerkAuthGuard)
  remove(@CurrentUser() user: User, @Param('postId') postId: string) {
    return this.posts.remove(user, postId);
  }

  @Get(':postId')
  @UseGuards(OptionalClerkAuthGuard)
  getOne(@Param('postId') postId: string, @CurrentUser() user?: User) {
    return this.posts.getOne(postId, user);
  }
}

@ApiTags('creators')
@Controller('creators')
export class CreatorPostsController {
  constructor(private readonly posts: PostsService) {}

  @Get(':username/posts')
  feed(@Param('username') username: string, @Query() pagination: PostPaginationDto) {
    return this.posts.getCreatorFeed(username, pagination);
  }
}
