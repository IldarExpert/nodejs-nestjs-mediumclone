import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthUserDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;
}
