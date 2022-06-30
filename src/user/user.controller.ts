import { Body, Controller, Get, HttpCode, Post, Put, UseGuards, UsePipes } from '@nestjs/common';
import { BackendValidationPipe } from '../pipes/backendValidation.pipe';
import { UserDecorator } from './decorators/user.decorator';
import { AuthUserDto } from './dto/authUser.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { AuthGuard } from './guards/auth.guard';
import { UserResponseInterface } from './types/userResponse.interface';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UsePipes(new BackendValidationPipe())
  async createUser(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('users/login')
  @HttpCode(200)
  @UsePipes(new BackendValidationPipe())
  async authUser(@Body('user') authUserDto: AuthUserDto): Promise<UserResponseInterface> {
    const user = await this.userService.login(authUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(
    // @Req() request: ExpressRequestInterface,
    @UserDecorator() user: UserEntity,
  ): Promise<UserResponseInterface> {
    return this.userService.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateUser(
    @Body('user') updateUserDto: UpdateUserDto,
    @UserDecorator('id') userId: number,
  ): Promise<UserResponseInterface | undefined> {
    const updatedUser = await this.userService.updateUser(updateUserDto, userId);
    if (updatedUser) {
      return this.userService.buildUserResponse(updatedUser);
    }
  }
}
