import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { JamSetlistEntity } from '../entity/jam-setlist.entity';

@Injectable()
export class JamSetlistRepository extends Repository<JamSetlistEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(JamSetlistEntity, dataSource.createEntityManager());
  }

  public async findByJamId(jamId: string): Promise<JamSetlistEntity[]> {
    return this.find({ where: { jamId } });
  }

  public async findByJamIds(jamIds: string[]): Promise<JamSetlistEntity[]> {
    if (jamIds.length === 0) return [];
    return this.find({ where: { jamId: In(jamIds) } });
  }
}
