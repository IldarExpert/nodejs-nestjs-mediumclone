import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorService } from '../shared/error.service';
import { UserEntity } from '../user/user.entity';
import { FollowEntity } from './follow.entity';
import { ProfileInterface } from './types/profile.interface';
import { ProfileResponseInterface } from './types/profileResponse.interface';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity) private readonly followRepository: Repository<FollowEntity>,
    private readonly errorService: ErrorService,
  ) {}

  buildProfileResponse(profile: ProfileInterface): ProfileResponseInterface {
    delete profile.email;
    return { profile };
  }

  async findProfile(profileUsername: string, userId: number): Promise<ProfileInterface> {
    const user = await this.userRepository.findOne({ username: profileUsername });
    if (!user) {
      throw new HttpException(
        this.errorService.transformError('profile', `User ${profileUsername} not found`),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const follow = await this.followRepository.findOne({
      followerId: userId,
      followingId: user.id,
    });

    return { ...user, following: Boolean(follow) };
  }

  async followUser(profileUsername: string, userId: number): Promise<ProfileInterface> {
    const user = await this.userRepository.findOne({ username: profileUsername });
    if (!user) {
      throw new HttpException(
        this.errorService.transformError('profile', `User ${profileUsername} not found`),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    if (user.id === userId) {
      throw new HttpException(
        this.errorService.transformError('profile', 'You cannot follow yourself'),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const follow = await this.followRepository.findOne({
      followerId: userId,
      followingId: user.id,
    });

    if (!follow) {
      const newFollow = new FollowEntity();
      Object.assign(newFollow, {
        followerId: userId,
        followingId: user.id,
      });
      await this.followRepository.save(newFollow);
    }
    return { ...user, following: true };
  }

  async unfollowUser(profileUsername: string, userId: number): Promise<ProfileInterface> {
    const user = await this.userRepository.findOne({ username: profileUsername });
    if (!user) {
      throw new HttpException(
        this.errorService.transformError('profile', `User ${profileUsername} not found`),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const follow = await this.followRepository.findOne({
      followerId: userId,
      followingId: user.id,
    });
    if (follow) {
      await this.followRepository.delete({ ...follow });
    }

    return { ...user, following: false };
  }
}
