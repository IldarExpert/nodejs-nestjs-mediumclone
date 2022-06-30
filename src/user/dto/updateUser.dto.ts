import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNotEmpty()
  @IsOptional()
  password?: string;

  @IsNotEmpty()
  @IsOptional()
  username?: string;

  bio?: string;

  image?: string;
}
