import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { NotifiedArticleEntity } from '../entity/notified-article.entity';

@Injectable()
export class NotifiedArticleRepository extends Repository<NotifiedArticleEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(NotifiedArticleEntity, dataSource.createEntityManager());
  }

  public async findAllIds(): Promise<string[]> {
    const rows = await this.find({ select: ['mediumArticleId'] });
    return rows.map((r) => r.mediumArticleId);
  }

  public async markAsNotified(mediumArticleId: string): Promise<void> {
    await this.save(this.create({ mediumArticleId }));
  }
}
