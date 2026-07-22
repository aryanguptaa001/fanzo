import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PostStatus,
  PostVisibility,
  User,
  UserRole,
  type Post,
  type PostMedia,
} from '@fanzo/database';
import { MediaStorageService } from '../../media/media-storage.service';
import { MAX_MEDIA_PER_POST } from '../../media/media-storage.constants';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostPaginationDto } from './dto/post-pagination.dto';
import { UpdatePostDto } from './dto/update-post.dto';

type PostWithMedia = Post & { media: PostMedia[] };

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaStorage: MediaStorageService,
  ) {}

  async create(user: User, dto: CreatePostDto) {
    const creator = await this.requireCreator(user);
    const post = await this.prisma.post.create({
      data: {
        creatorProfileId: creator.id,
        caption: dto.caption || null,
        visibility: dto.visibility,
      },
      include: { media: { orderBy: { sortOrder: 'asc' } } },
    });
    return this.toOwnerPost(post);
  }

  async uploadMedia(user: User, postId: string, files: Express.Multer.File[]) {
    if (!files.length) throw new BadRequestException('At least one media file is required');
    const { post, creator } = await this.requireOwnedPost(user, postId);
    if (post.media.length + files.length > MAX_MEDIA_PER_POST) {
      throw new BadRequestException(`A post can contain at most ${MAX_MEDIA_PER_POST} media items`);
    }
    files.forEach((file) => this.mediaStorage.validate(file));
    let sortOrder = post.media.length;
    for (const file of files) {
      const uploaded = await this.mediaStorage.upload(creator.id, post.id, file);
      await this.prisma.postMedia.create({
        data: { ...uploaded, postId: post.id, sortOrder: sortOrder++ },
      });
    }
    return this.getOwnedPost(user, postId);
  }

  async update(user: User, postId: string, dto: UpdatePostDto) {
    const { post } = await this.requireOwnedPost(user, postId);
    const updated = await this.prisma.post.update({
      where: { id: post.id },
      data: {
        ...(dto.caption !== undefined ? { caption: dto.caption || null } : {}),
        ...(dto.visibility ? { visibility: dto.visibility } : {}),
      },
      include: { media: { orderBy: { sortOrder: 'asc' } } },
    });
    return this.toOwnerPost(updated);
  }

  async publish(user: User, postId: string) {
    const { post } = await this.requireOwnedPost(user, postId);
    if (!post.caption?.trim() && post.media.length === 0)
      throw new BadRequestException('Add a caption or media before publishing');
    const updated = await this.prisma.post.update({
      where: { id: post.id },
      data: { status: PostStatus.PUBLISHED, publishedAt: new Date() },
      include: { media: { orderBy: { sortOrder: 'asc' } } },
    });
    return this.toOwnerPost(updated);
  }

  async unpublish(user: User, postId: string) {
    const { post } = await this.requireOwnedPost(user, postId);
    // Clearing publishedAt makes a later republish appear at the correct position in the public feed.
    const updated = await this.prisma.post.update({
      where: { id: post.id },
      data: { status: PostStatus.DRAFT, publishedAt: null },
      include: { media: { orderBy: { sortOrder: 'asc' } } },
    });
    return this.toOwnerPost(updated);
  }

  async remove(user: User, postId: string) {
    const { post } = await this.requireOwnedPost(user, postId);
    await this.prisma.post.update({
      where: { id: post.id },
      data: { status: PostStatus.ARCHIVED, deletedAt: new Date() },
    });
    return { deleted: true };
  }

  async removeMedia(user: User, postId: string, mediaId: string) {
    const { post } = await this.requireOwnedPost(user, postId);
    const media = post.media.find((item) => item.id === mediaId);
    if (!media) throw new NotFoundException('Media item not found');
    // Storage cleanup is intentionally deferred; removing metadata immediately prevents public exposure.
    await this.prisma.postMedia.delete({ where: { id: media.id } });
    return this.getOwnedPost(user, postId);
  }

  async listMine(user: User, pagination: PostPaginationDto) {
    const creator = await this.requireCreator(user);
    const where = { creatorProfileId: creator.id, deletedAt: null };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        include: { media: { orderBy: { sortOrder: 'asc' as const } } },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      this.prisma.post.count({ where }),
    ]);
    return {
      items: items.map((post) => this.toOwnerPost(post)),
      page: pagination.page,
      total,
      hasMore: pagination.page * pagination.limit < total,
    };
  }

  async getOne(postId: string, user?: User) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
      include: { media: { orderBy: { sortOrder: 'asc' } }, creatorProfile: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    const publicPost =
      post.status === PostStatus.PUBLISHED &&
      post.visibility === PostVisibility.PUBLIC &&
      !post.creatorProfile.deletedAt;
    const owned = user ? post.creatorProfile.userId === user.id : false;
    if (!publicPost && !owned) throw new NotFoundException('Post not found');
    return publicPost ? this.toPublicPost(post) : this.toOwnerPost(post);
  }

  async getOwnedPost(user: User, postId: string) {
    const { post } = await this.requireOwnedPost(user, postId);
    return this.toOwnerPost(post);
  }

  async getCreatorFeed(username: string, pagination: PostPaginationDto) {
    const creator = await this.prisma.creatorProfile.findFirst({
      where: {
        username: username.toLowerCase(),
        deletedAt: null,
        user: { isActive: true, deletedAt: null },
      },
    });
    if (!creator) throw new NotFoundException('Creator profile not found');
    const where = {
      creatorProfileId: creator.id,
      status: PostStatus.PUBLISHED,
      visibility: PostVisibility.PUBLIC,
      deletedAt: null,
    };
    const posts = await this.prisma.post.findMany({
      where,
      include: { media: { orderBy: { sortOrder: 'asc' } } },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit + 1,
    });
    const hasMore = posts.length > pagination.limit;
    return {
      items: posts
        .slice(0, pagination.limit)
        .map((post) => this.toPublicPost({ ...post, creatorProfile: creator })),
      nextCursor: hasMore ? String(pagination.page + 1) : null,
    };
  }

  private async requireCreator(user: User) {
    if (user.role !== UserRole.CREATOR)
      throw new ForbiddenException('A creator profile is required');
    const creator = await this.prisma.creatorProfile.findFirst({
      where: { userId: user.id, deletedAt: null },
    });
    if (!creator) throw new ForbiddenException('A creator profile is required');
    return creator;
  }

  private async requireOwnedPost(user: User, postId: string) {
    const creator = await this.requireCreator(user);
    const post = await this.prisma.post.findFirst({
      where: { id: postId, creatorProfileId: creator.id, deletedAt: null },
      include: { media: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!post) throw new NotFoundException('Post not found');
    return { post, creator };
  }

  private toOwnerPost(post: PostWithMedia) {
    return {
      id: post.id,
      caption: post.caption,
      status: post.status,
      visibility: post.visibility,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      media: post.media.map((media) => this.toMedia(media, true)),
    };
  }

  private toPublicPost(
    post: PostWithMedia & {
      creatorProfile: {
        username: string;
        displayName: string;
        avatarUrl: string | null;
        verificationStatus: string;
      };
    },
  ) {
    return {
      id: post.id,
      caption: post.caption,
      publishedAt: post.publishedAt,
      visibility: post.visibility,
      media: post.media.map((media) => this.toMedia(media, false)),
      creator: {
        username: post.creatorProfile.username,
        displayName: post.creatorProfile.displayName,
        avatarUrl: post.creatorProfile.avatarUrl,
        verificationStatus: post.creatorProfile.verificationStatus,
      },
    };
  }

  private toMedia(media: PostMedia, owner: boolean) {
    return {
      id: media.id,
      type: media.type,
      url: media.url,
      mimeType: owner ? media.mimeType : undefined,
      sizeBytes: owner ? Number(media.sizeBytes) : undefined,
      width: media.width,
      height: media.height,
      durationSeconds: media.durationSeconds,
      sortOrder: media.sortOrder,
    };
  }
}
