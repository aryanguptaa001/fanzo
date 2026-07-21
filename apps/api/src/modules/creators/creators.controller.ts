import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { User } from '@fanzo/database';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CreatorsService } from './creators.service';
import { OnboardCreatorDto } from './dto/onboard-creator.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';

@ApiTags('creators')
@Controller('creators')
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  @Post('onboarding')
  @ApiBearerAuth()
  @UseGuards(ClerkAuthGuard)
  onboard(@CurrentUser() user: User, @Body() dto: OnboardCreatorDto) {
    return this.creatorsService.onboard(user, dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(ClerkAuthGuard)
  getMine(@CurrentUser() user: User) {
    return this.creatorsService.getMine(user.id);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(ClerkAuthGuard)
  updateMine(@CurrentUser() user: User, @Body() dto: UpdateCreatorDto) {
    return this.creatorsService.updateMine(user.id, dto);
  }

  @Get(':username')
  getPublic(@Param('username') username: string) {
    return this.creatorsService.getPublic(username);
  }
}
