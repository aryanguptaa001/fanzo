import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserRole, VerificationStatus, type CreatorProfile, type User } from '@fanzo/database';
import { CreatorsService } from './creators.service';

const now = new Date('2026-07-22T00:00:00.000Z');
const user = { id: 'user-id', role: UserRole.FAN } as User;
const profile: CreatorProfile = {
  id: 'profile-id',
  userId: user.id,
  username: 'aryan',
  displayName: 'Aryan',
  bio: 'Creator',
  avatarUrl: null,
  coverImageUrl: null,
  websiteUrl: null,
  location: 'Mumbai',
  category: 'Technology',
  languages: ['English'],
  theme: 'midnight',
  accentColor: '#7c3aed',
  isAvailableForChat: true,
  isAvailableForAudioCall: false,
  isAvailableForVideoCall: false,
  isAvailableForBrandDeals: true,
  verificationStatus: VerificationStatus.NONE,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
};

function setup() {
  const transaction = {
    creatorProfile: { create: jest.fn().mockResolvedValue(profile), update: jest.fn() },
    user: { update: jest.fn() },
  };
  const prisma = {
    creatorProfile: { findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(async (callback: (client: typeof transaction) => unknown) =>
      callback(transaction),
    ),
  };
  return { service: new CreatorsService(prisma as never), prisma, transaction };
}

describe('CreatorsService', () => {
  it('onboards a fan, normalizes username, creates the profile, and promotes the role', async () => {
    const { service, prisma, transaction } = setup();
    prisma.creatorProfile.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    const result = await service.onboard(user, { username: ' Aryan ', displayName: 'Aryan' });
    expect(transaction.creatorProfile.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ username: 'aryan', userId: user.id }),
      }),
    );
    expect(transaction.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { role: UserRole.CREATOR },
    });
    expect(result.username).toBe('aryan');
  });

  it('rejects a reserved username', async () => {
    const { service } = setup();
    await expect(
      service.onboard(user, { username: 'ADMIN', displayName: 'Aryan' }),
    ).rejects.toThrow(ConflictException);
  });

  it('rejects a duplicate username', async () => {
    const { service, prisma } = setup();
    prisma.creatorProfile.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...profile, userId: 'another-user' });
    await expect(
      service.onboard(user, { username: 'aryan', displayName: 'Aryan' }),
    ).rejects.toThrow('That username is already taken');
  });

  it('returns the authenticated creator profile', async () => {
    const { service, prisma } = setup();
    prisma.creatorProfile.findFirst.mockResolvedValue(profile);
    await expect(service.getMine(user.id)).resolves.toMatchObject({
      username: 'aryan',
      displayName: 'Aryan',
    });
    expect(prisma.creatorProfile.findFirst).toHaveBeenCalledWith({
      where: { userId: user.id, deletedAt: null },
    });
  });

  it('returns a safe public creator response with placeholder counts', async () => {
    const { service, prisma } = setup();
    prisma.creatorProfile.findFirst.mockResolvedValue(profile);
    const result = await service.getPublic('ARYAN');
    expect(result).toMatchObject({
      username: 'aryan',
      followersCount: 0,
      postsCount: 0,
      subscribersCount: 0,
      capabilities: { messaging: true, live: false },
    });
    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('userId');
  });

  it('returns 404 for a missing public creator', async () => {
    const { service, prisma } = setup();
    prisma.creatorProfile.findFirst.mockResolvedValue(null);
    await expect(service.getPublic('missing')).rejects.toThrow(NotFoundException);
  });
});
