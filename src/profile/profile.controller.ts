import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserDecorator } from '../user/decorators/user.decorator';
import { AuthGuard } from '../user/guards/auth.guard';
import { ProfileService } from './profile.service';
import { ProfileResponseInterface } from './types/profileResponse.interface';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @Param('username') profileUsername: string,
    @UserDecorator('id') userId: number,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.findProfile(profileUsername, userId);
    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followUser(
    @Param('username') username: string,
    @UserDecorator('id') userId: number,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.followUser(username, userId);
    return this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unfollowUser(
    @Param('username') username: string,
    @UserDecorator('id') userId: number,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.unfollowUser(username, userId);
    return this.profileService.buildProfileResponse(profile);
  }
}
