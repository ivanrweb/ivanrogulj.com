import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PhraseEntity } from '../entity/phrase.entity';

@Injectable()
export class PhraseRepository extends Repository<PhraseEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(PhraseEntity, dataSource.createEntityManager());
  }

  public async findByJamId(jamId: string): Promise<PhraseEntity[]> {
    return this.find({ where: { jamId }, order: { sortOrder: 'ASC', createdAt: 'ASC' } });
  }
}
