import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { JamCategoryEntity } from '../entity/jam-category.entity';

@Injectable()
export class JamCategoryRepository extends Repository<JamCategoryEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(JamCategoryEntity, dataSource.createEntityManager());
  }

  public async findByJamId(jamId: string): Promise<JamCategoryEntity[]> {
    return this.find({ where: { jamId } });
  }

  public async findByJamIds(jamIds: string[]): Promise<JamCategoryEntity[]> {
    if (jamIds.length === 0) return [];
    return this.find({ where: { jamId: In(jamIds) } });
  }
}
