import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { BackendValidationPipe } from '../pipes/backendValidation.pipe';
import { UserDecorator } from '../user/decorators/user.decorator';
import { AuthGuard } from '../user/guards/auth.guard';
import { UserEntity } from '../user/user.entity';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { ArticleListResponseInterface } from './types/articleListResponse.interface';
import { ArticleResponseInterface } from './types/articleResponse.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async getAllArticles(
    @UserDecorator('id') userId: number,
    @Query('tag') tag: string,
    @Query('author') author: string,
    @Query('favorited') favorited: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ): Promise<ArticleListResponseInterface> {
    return this.articleService.findAllArticles(userId, tag, author, favorited, limit, offset);
  }

  @Get('feed')
  @UseGuards(AuthGuard)
  async feedArticles(
    @UserDecorator('id') userId: number,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ): Promise<ArticleListResponseInterface> {
    return this.articleService.feedArticles(userId, limit, offset);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async create(
    @Body('article') dto: CreateArticleDto,
    @UserDecorator() user: UserEntity,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(dto, user);
    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  async getArticleBySlug(@Param('slug') slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getArticleBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @Param('slug') slug: string,
    @UserDecorator('id') userId: number,
  ): Promise<void> {
    await this.articleService.deleteArticle(slug, userId);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateArticle(
    @Body('article') dto: UpdateArticleDto,
    @Param('slug') slug: string,
    @UserDecorator('id') userId: number,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.updateArticle(slug, dto, userId);
    return this.articleService.buildArticleResponse(article);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async addArticleToFavorite(
    @Param('slug') slug: string,
    @UserDecorator('id') userId: number,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorite(slug, userId);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async deleteArticleFromFavorite(
    @Param('slug') slug: string,
    @UserDecorator('id') userId: number,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.deleteArticleFromFavorite(slug, userId);
    return this.articleService.buildArticleResponse(article);
  }
}
