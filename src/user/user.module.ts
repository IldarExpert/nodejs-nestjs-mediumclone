import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigsService } from '../configs/configs.service';
import { ErrorService } from '../shared/error.service';
import { AuthGuard } from './guards/auth.guard';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService, ConfigsService, AuthGuard, ErrorService],
  exports: [UserService, ConfigsService],
})
export class UserModule {}
