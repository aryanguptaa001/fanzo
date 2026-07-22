import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  MediaType,
  PostStatus,
  PostVisibility,
  UserRole,
  VerificationStatus,
  type User,
} from '@fanzo/database';
import { PostsService } from './posts.service';

const creator = {
  id: 'creator-id',
  userId: 'user-id',
  username: 'aryan',
  displayName: 'Aryan',
  avatarUrl: null,
  verificationStatus: VerificationStatus.NONE,
  deletedAt: null,
};
const creatorUser = { id: 'user-id', role: UserRole.CREATOR } as User;
const otherCreatorUser = { id: 'other-user', role: UserRole.CREATOR } as User;
const basePost = {
  id: 'post-id',
  creatorProfileId: creator.id,
  caption: 'Hello',
  status: PostStatus.DRAFT,
  visibility: PostVisibility.PUBLIC,
  publishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  media: [],
};

function setup() {
  const prisma = {
    creatorProfile: { findFirst: jest.fn().mockResolvedValue(creator) },
    post: {
      create: jest.fn().mockResolvedValue(basePost),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    postMedia: { create: jest.fn(), delete: jest.fn() },
    $transaction: jest.fn(),
  };
  const mediaStorage = { validate: jest.fn(), upload: jest.fn() };
  return {
    service: new PostsService(prisma as never, mediaStorage as never),
    prisma,
    mediaStorage,
  };
}

describe('PostsService', () => {
  it('allows a creator to create a draft', async () => {
    const { service, prisma } = setup();
    const result = await service.create(creatorUser, {
      caption: 'Hello',
      visibility: PostVisibility.PUBLIC,
    });
    expect(result.status).toBe(PostStatus.DRAFT);
    expect(prisma.post.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ creatorProfileId: creator.id }) }),
    );
  });

  it('does not allow a non-creator to create a post', async () => {
    const { service } = setup();
    await expect(
      service.create({ id: 'fan', role: UserRole.FAN } as User, {
        visibility: PostVisibility.PUBLIC,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('does not allow a creator to edit another creator post', async () => {
    const { service, prisma } = setup();
    prisma.creatorProfile.findFirst.mockResolvedValue({
      ...creator,
      id: 'other-creator',
      userId: otherCreatorUser.id,
    });
    prisma.post.findFirst.mockResolvedValue(null);
    await expect(
      service.update(otherCreatorUser, basePost.id, { caption: 'Nope' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects publishing an empty post', async () => {
    const { service, prisma } = setup();
    prisma.post.findFirst.mockResolvedValue({ ...basePost, caption: null, media: [] });
    await expect(service.publish(creatorUser, basePost.id)).rejects.toThrow(BadRequestException);
  });

  it('publishes a valid post', async () => {
    const { service, prisma } = setup();
    prisma.post.findFirst.mockResolvedValue(basePost);
    prisma.post.update.mockResolvedValue({
      ...basePost,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
    });
    await expect(service.publish(creatorUser, basePost.id)).resolves.toMatchObject({
      status: PostStatus.PUBLISHED,
    });
  });

  it('does not return a draft publicly', async () => {
    const { service, prisma } = setup();
    prisma.post.findFirst.mockResolvedValue({ ...basePost, creatorProfile: creator });
    await expect(service.getOne(basePost.id)).rejects.toThrow(NotFoundException);
  });

  it('does not return a deleted post publicly', async () => {
    const { service, prisma } = setup();
    prisma.post.findFirst.mockResolvedValue(null);
    await expect(service.getOne(basePost.id)).rejects.toThrow(NotFoundException);
  });

  it('filters the public creator feed to public published posts', async () => {
    const { service, prisma } = setup();
    prisma.post.findMany.mockResolvedValue([]);
    await service.getCreatorFeed('ARYAN', { page: 1, limit: 12 });
    expect(prisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: PostStatus.PUBLISHED,
          visibility: PostVisibility.PUBLIC,
          deletedAt: null,
        }),
      }),
    );
  });

  it('enforces the maximum media count', async () => {
    const { service, prisma, mediaStorage } = setup();
    const media = Array.from({ length: 10 }, (_, index) => ({
      id: `media-${index}`,
      type: MediaType.IMAGE,
    }));
    prisma.post.findFirst.mockResolvedValue({ ...basePost, media });
    await expect(
      service.uploadMedia(creatorUser, basePost.id, [
        { mimetype: 'image/jpeg' },
      ] as Express.Multer.File[]),
    ).rejects.toThrow('at most 10');
    expect(mediaStorage.validate).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing post', async () => {
    const { service, prisma } = setup();
    prisma.post.findFirst.mockResolvedValue(null);
    await expect(service.getOne('missing')).rejects.toThrow(NotFoundException);
  });
});
