import { UserEntity } from '../../user/user.entity';

export type ProfileInterface = Partial<Pick<UserEntity, 'email'>> &
  Pick<UserEntity, 'bio' | 'image' | 'username'> & {
    following: boolean;
  };
