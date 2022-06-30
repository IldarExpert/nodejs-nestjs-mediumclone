import { ArticleEntity } from '../article.entity';

export type ArticleWithFavoritesType = ArticleEntity & { favorited: boolean };
