import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { getRepository, Repository } from 'typeorm';
import { FollowEntity } from '../profile/follow.entity';
import { ErrorService } from '../shared/error.service';
import { UserEntity } from '../user/user.entity';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { ArticleListResponseInterface } from './types/articleListResponse.interface';
import { ArticleResponseInterface } from './types/articleResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity) private readonly followRepository: Repository<FollowEntity>,
    private readonly errorService: ErrorService,
  ) {}

  async findAllArticles(
    userId: number,
    tag: string,
    author: string,
    favorited: string,
    limit: number,
    offset: number,
  ): Promise<ArticleListResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'a1');

    queryBuilder.orderBy('articles.updatedAt', 'DESC');

    if (author) {
      const foundAuthor = await this.userRepository.findOne({
        username: author,
      });

      queryBuilder.andWhere('articles.authorId = :id', {
        id: foundAuthor?.id,
      });
    }

    if (tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${tag}%`,
      });
    }

    if (favorited) {
      const foundAuthor = await this.userRepository.findOne(
        {
          username: favorited,
        },
        {
          relations: ['favorites'],
        },
      );
      if (foundAuthor) {
        const ids = foundAuthor.favorites.map((favorite) => favorite.id);
        if (ids.length > 0) {
          queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
        } else {
          queryBuilder.andWhere('1=0');
        }
      }
    }

    queryBuilder.limit(limit).offset(offset);

    let favoriteIds: number[] = [];
    if (userId) {
      const user = await this.userRepository.findOne(userId, {
        relations: ['favorites'],
      });
      if (user) {
        favoriteIds = user?.favorites.map((favorite) => favorite.id);
      }
    }

    const articlesCount = await queryBuilder.getCount();
    const articles: ArticleEntity[] = await queryBuilder.getMany();

    // articles.forEach((article) => {
    //   (article as ArticleWithFavoritesType).favorited = favoriteIds.includes(article.id);
    // });
    const articleWithFavorites = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articleWithFavorites, articlesCount };
  }

  async feedArticles(
    userId: number,
    limit: number,
    offset: number,
  ): Promise<ArticleListResponseInterface> {
    const follows = await this.followRepository.find({
      followerId: userId,
    });
    if (follows.length === 0) {
      return { articles: [], articlesCount: 0 };
    }
    const followIds = follows.map((follow) => follow.followingId);

    const queryBuilder = getRepository(ArticleEntity).createQueryBuilder('articles');
    // .leftJoinAndSelect('articles.author', 'a1');
    queryBuilder.andWhere('articles.authorId IN (:...ids)', { ids: followIds });
    queryBuilder.orderBy('articles.updatedAt', 'DESC');
    queryBuilder.limit(limit).offset(offset);
    const articlesCount = await queryBuilder.getCount();
    const articles: ArticleEntity[] = await queryBuilder.getMany();
    return { articles, articlesCount };
  }

  async createArticle(dto: CreateArticleDto, user: UserEntity): Promise<ArticleEntity> {
    const newArticle = new ArticleEntity();
    Object.assign(newArticle, dto);
    if (!newArticle.tagList) {
      newArticle.tagList = [];
    }
    newArticle.author = user;
    newArticle.slug = this.getSlug(dto.title);
    return this.articleRepository.save(newArticle);
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return {
      article: article,
    };
  }

  private getSlug(title: string): string {
    return slugify(title, { lower: true }) + '-' + Math.random().toString(36).slice(2);
  }

  async getArticleBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ slug });
    if (!article) {
      throw new HttpException(
        this.errorService.transformError('Article', `Article with ${slug} not found`),
        HttpStatus.BAD_REQUEST,
      );
    }
    return article;
  }

  async deleteArticle(slug: string, userId: number): Promise<void> {
    const article = await this.getArticleBySlug(slug);
    if (!article) {
      throw new HttpException(
        this.errorService.transformError('Article', `Article with ${slug} not found`),
        HttpStatus.BAD_REQUEST,
      );
    }
    if (article.author.id !== userId) {
      throw new HttpException(
        this.errorService.transformError('Article', `You are not an author`),
        HttpStatus.FORBIDDEN,
      );
    }
    await this.articleRepository.delete({ slug });
  }

  async updateArticle(slug: string, dto: UpdateArticleDto, userId: number): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    if (!article) {
      throw new HttpException(
        this.errorService.transformError('Article', `Article with ${slug} not found`),
        HttpStatus.BAD_REQUEST,
      );
    }
    if (article.author.id !== userId) {
      throw new HttpException(
        this.errorService.transformError('Article', `You are not an author`),
        HttpStatus.FORBIDDEN,
      );
    }

    Object.assign(article, dto);
    if (dto && dto.title) {
      article.slug = this.getSlug(dto.title);
    }
    return this.articleRepository.save(article);
  }

  async addArticleToFavorite(slug: string, userId: number): Promise<ArticleEntity> {
    const user = await this.userRepository.findOne(userId, {
      relations: ['favorites'],
    });
    if (!user) {
      throw new HttpException(
        this.errorService.transformError('Article', 'User not found'),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const article = await this.getArticleBySlug(slug);
    const isFavoritedFound = user.favorites.find((userFavorite) => userFavorite.id === article.id);
    if (!isFavoritedFound) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorite(slug: string, userId: number): Promise<ArticleEntity> {
    const user = await this.userRepository.findOne(userId, {
      relations: ['favorites'],
    });
    if (!user) {
      throw new HttpException(
        this.errorService.transformError('Article', 'User not found'),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const article = await this.getArticleBySlug(slug);
    const indexFavorite = user.favorites.findIndex(
      (userFavorite) => userFavorite.id === article.id,
    );
    console.log(indexFavorite);
    if (indexFavorite !== -1) {
      article.favoritesCount--;
      user.favorites.splice(indexFavorite, 1);
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }
}
