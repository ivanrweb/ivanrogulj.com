import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ArticleCategory } from '@ivanrogulj.com/shared/data-access/model';
import { ArticleEntity } from '../entity/article.entity';

@Injectable()
export class ArticleRepository extends Repository<ArticleEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(ArticleEntity, dataSource.createEntityManager());
  }

  public async findAll(category?: ArticleCategory): Promise<ArticleEntity[]> {
    const qb = this.createQueryBuilder('article').orderBy('article.createdAt', 'DESC');
    if (category) {
      qb.where('article.category = :category', { category });
    }
    return qb.getMany();
  }

  public async findBySlug(slug: string): Promise<ArticleEntity | null> {
    return this.createQueryBuilder('article')
      .where('article.slug = :slug', { slug })
      .getOne();
  }

  public async findById(id: string): Promise<ArticleEntity | null> {
    return this.createQueryBuilder('article')
      .where('article.id = :id', { id })
      .getOne();
  }
}
