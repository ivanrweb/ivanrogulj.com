import { ArticleCategory } from '@ivanrogulj.com/shared/data-access/model';

export class UpdateArticleDto {
  public title?: string;
  public content?: string;
  public category?: ArticleCategory;
  public published?: boolean;
}
