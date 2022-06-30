import { ProfileInterface } from './profile.interface';

export interface ProfileResponseInterface {
  profile: Omit<ProfileInterface, 'email'>;
}
