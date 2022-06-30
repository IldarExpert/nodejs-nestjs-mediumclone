import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { ConfigsService } from '../configs/configs.service';
import { ErrorService } from '../shared/error.service';
import { AuthUserDto } from './dto/authUser.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @Inject(ConfigsService) private readonly configService: ConfigsService,
    @Inject(ErrorService) private readonly errorService: ErrorService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      email: createUserDto.email,
    });
    const userByUsername = await this.userRepository.findOne({
      username: createUserDto.username,
    });

    if (userByEmail) {
      throw new HttpException(
        this.errorService.transformError('user', 'Email are taken'),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    if (userByUsername) {
      throw new HttpException(
        this.errorService.transformError('user', 'Username are taken'),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return this.userRepository.save(newUser);
  }

  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      this.configService.getConfig('JWT_SECRET'),
    );
  }

  async validPasswords(authUserDtoPassword: string, userByEmailPassword: string): Promise<boolean> {
    return await compare(authUserDtoPassword, userByEmailPassword);
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }

  async login(authUserDto: AuthUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne(
      {
        email: authUserDto.email,
      },
      {
        select: ['id', 'email', 'password', 'username', 'bio', 'image'],
      },
    );

    if (!userByEmail) {
      throw new HttpException(
        this.errorService.transformError('user', `User with email ${authUserDto.email} not found`),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordValid = await this.validPasswords(authUserDto.password, userByEmail.password);
    if (!isPasswordValid) {
      throw new HttpException(
        this.errorService.transformError('user', 'Password not valid'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const { password: _, ...result } = userByEmail;

    return result as UserEntity;
  }

  async findById(id: number): Promise<UserEntity | undefined> {
    return await this.userRepository.findOne(id);
  }

  async updateUser(updateUserDto: UpdateUserDto, userId: number): Promise<UserEntity | undefined> {
    if (updateUserDto.email) {
      const existedUserByEmail = await this.userRepository.findOne({ email: updateUserDto.email });
      if (existedUserByEmail && existedUserByEmail.id !== userId) {
        throw new HttpException(
          this.errorService.transformError('user', 'Email are taken'),
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }
    if (updateUserDto.username) {
      const existedUserByUsername = await this.userRepository.findOne({
        username: updateUserDto.username,
      });
      if (existedUserByUsername && existedUserByUsername.id !== userId) {
        throw new HttpException(
          this.errorService.transformError('user', 'Username are taken'),
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }
    if (typeof updateUserDto.password !== 'string') {
      throw new HttpException(
        this.errorService.transformError('user', 'Password is not string'),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    // const user = await this.findById(userId);
    // console.log(user);
    // const newUserData = new UserEntity();
    // if (user) {
    //   Object.assign(newUserData, user, updateUserDto);
    //   console.log(newUserData);
    //   return this.userRepository.save(newUserData);
    // }
    try {
      const newUserData = new UserEntity();
      Object.assign(newUserData, updateUserDto);
      const result = await this.userRepository.update(userId, newUserData);
      if (result.affected) {
        return this.findById(userId);
      }
    } catch (e) {
      throw new HttpException(
        this.errorService.transformError('user', 'Unknown fields added'),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
