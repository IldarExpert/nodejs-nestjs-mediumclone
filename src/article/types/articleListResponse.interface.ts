import { ArticleType } from './article.type';

export interface ArticleListResponseInterface {
  articles: ArticleType[];
  articlesCount: number;
}
