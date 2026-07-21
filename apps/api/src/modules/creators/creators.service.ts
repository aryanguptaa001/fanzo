import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatorProfile, Prisma, User, UserRole } from '@fanzo/database';
import { PrismaService } from '../../prisma/prisma.service';
import { isReservedCreatorUsername, normalizeCreatorUsername } from './creator-username';
import { OnboardCreatorDto } from './dto/onboard-creator.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';

@Injectable()
export class CreatorsService {
  constructor(private readonly prisma: PrismaService) {}

  async onboard(user: User, dto: OnboardCreatorDto) {
    const username = normalizeCreatorUsername(dto.username);
    this.assertUsernameAvailable(username);

    const existingProfile = await this.prisma.creatorProfile.findUnique({
      where: { userId: user.id },
    });
    if (existingProfile && !existingProfile.deletedAt) {
      if (existingProfile.username !== username) {
        throw new ConflictException('Creator onboarding has already been completed');
      }
      return this.toOwnerResponse(existingProfile);
    }

    if (user.role !== UserRole.FAN && user.role !== UserRole.CREATOR) {
      throw new ForbiddenException('This account cannot complete creator onboarding');
    }

    const usernameOwner = await this.prisma.creatorProfile.findUnique({ where: { username } });
    if (usernameOwner && usernameOwner.userId !== user.id) {
      throw new ConflictException('That username is already taken');
    }

    const data = {
      username,
      displayName: dto.displayName,
      bio: dto.bio,
      category: dto.category,
      location: dto.location,
      languages: dto.languages ?? [],
      websiteUrl: dto.websiteUrl,
      deletedAt: null,
    };

    try {
      const profile = await this.prisma.$transaction(async (transaction) => {
        const savedProfile = existingProfile
          ? await transaction.creatorProfile.update({ where: { id: existingProfile.id }, data })
          : await transaction.creatorProfile.create({ data: { ...data, userId: user.id } });
        await transaction.user.update({ where: { id: user.id }, data: { role: UserRole.CREATOR } });
        return savedProfile;
      });
      return this.toOwnerResponse(profile);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('That username is already taken');
      }
      throw error;
    }
  }

  async getMine(userId: string) {
    const profile = await this.prisma.creatorProfile.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!profile) throw new NotFoundException('Creator onboarding has not been completed');
    return this.toOwnerResponse(profile);
  }

  async updateMine(userId: string, dto: UpdateCreatorDto) {
    const profile = await this.prisma.creatorProfile.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!profile) throw new NotFoundException('Creator onboarding has not been completed');
    const updated = await this.prisma.creatorProfile.update({
      where: { id: profile.id },
      data: dto,
    });
    return this.toOwnerResponse(updated);
  }

  async getPublic(usernameInput: string) {
    const username = normalizeCreatorUsername(usernameInput);
    const profile = await this.prisma.creatorProfile.findFirst({
      where: { username, deletedAt: null, user: { isActive: true, deletedAt: null } },
    });
    if (!profile) throw new NotFoundException('Creator profile not found');
    return this.toPublicResponse(profile);
  }

  private assertUsernameAvailable(username: string) {
    if (isReservedCreatorUsername(username)) {
      throw new ConflictException('That username is reserved');
    }
  }

  private toOwnerResponse(profile: CreatorProfile) {
    return {
      ...this.toPublicResponse(profile),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private toPublicResponse(profile: CreatorProfile) {
    return {
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      coverImageUrl: profile.coverImageUrl,
      websiteUrl: profile.websiteUrl,
      location: profile.location,
      category: profile.category,
      languages: profile.languages,
      verificationStatus: profile.verificationStatus,
      theme: profile.theme,
      accentColor: profile.accentColor,
      isAvailableForChat: profile.isAvailableForChat,
      isAvailableForAudioCall: profile.isAvailableForAudioCall,
      isAvailableForVideoCall: profile.isAvailableForVideoCall,
      isAvailableForBrandDeals: profile.isAvailableForBrandDeals,
      followersCount: 0,
      postsCount: 0,
      subscribersCount: 0,
      capabilities: {
        messaging: profile.isAvailableForChat,
        audioCall: profile.isAvailableForAudioCall,
        videoCall: profile.isAvailableForVideoCall,
        live: false,
        brandProposals: profile.isAvailableForBrandDeals,
      },
    };
  }
}
