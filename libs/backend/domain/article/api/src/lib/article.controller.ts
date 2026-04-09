import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { MediumArticle, MediumService } from './medium.service';

@Controller('articles')
export class ArticleController {
  public constructor(private readonly mediumService: MediumService) {}

  @Get()
  public async findAll(): Promise<Omit<MediumArticle, 'content'>[]> {
    const articles = await this.mediumService.getAll();
    return articles.map(({ content: _content, ...rest }) => rest);
  }

  @Get(':slug')
  public async findBySlug(@Param('slug') slug: string): Promise<MediumArticle> {
    const article = await this.mediumService.getBySlug(slug);
    if (!article) {
      throw new NotFoundException(`Article "${slug}" not found`);
    }
    return article;
  }
}
