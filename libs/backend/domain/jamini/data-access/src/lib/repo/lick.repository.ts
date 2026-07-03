import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LickEntity } from '../entity/lick.entity';

@Injectable()
export class LickRepository extends Repository<LickEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(LickEntity, dataSource.createEntityManager());
  }

  public async findByJamId(jamId: string): Promise<LickEntity[]> {
    return this.find({ where: { jamId }, order: { sortOrder: 'ASC', createdAt: 'ASC' } });
  }
}
