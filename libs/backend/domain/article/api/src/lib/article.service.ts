import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleCategory } from '@ivanrogulj.com/shared/data-access/model';
import { ArticleRepository } from '@ivanrogulj.com/backend/domain/article/data-access';
import { ArticleEntity } from '@ivanrogulj.com/backend/domain/article/data-access';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleService {
  public constructor(private readonly articleRepository: ArticleRepository) {}

  public async findAll(category?: ArticleCategory): Promise<ArticleEntity[]> {
    return this.articleRepository.findAll(category);
  }

  public async findBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findBySlug(slug);
    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }
    return article;
  }

  public async create(dto: CreateArticleDto): Promise<ArticleEntity> {
    const slug = this.generateSlug(dto.title);
    const article = this.articleRepository.create({ ...dto, slug });
    return this.articleRepository.save(article);
  }

  public async update(id: string, dto: UpdateArticleDto): Promise<ArticleEntity> {
    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new NotFoundException(`Article with id "${id}" not found`);
    }
    if (dto.title && dto.title !== article.title) {
      article.slug = this.generateSlug(dto.title);
    }
    Object.assign(article, dto);
    return this.articleRepository.save(article);
  }

  public async delete(id: string): Promise<void> {
    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new NotFoundException(`Article with id "${id}" not found`);
    }
    await this.articleRepository.remove(article);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
