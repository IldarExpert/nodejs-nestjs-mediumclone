import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowEntity } from '../profile/follow.entity';
import { ErrorService } from '../shared/error.service';
import { AuthGuard } from '../user/guards/auth.guard';
import { UserEntity } from '../user/user.entity';
import { ArticleController } from './article.controller';
import { ArticleEntity } from './article.entity';
import { ArticleService } from './article.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, UserEntity, FollowEntity])],
  controllers: [ArticleController],
  providers: [ArticleService, AuthGuard, ErrorService],
  exports: [],
})
export class ArticleModule {}
