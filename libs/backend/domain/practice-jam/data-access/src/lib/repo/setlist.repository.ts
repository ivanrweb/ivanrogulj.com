import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SetlistEntity } from '../entity/setlist.entity';

@Injectable()
export class SetlistRepository extends Repository<SetlistEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(SetlistEntity, dataSource.createEntityManager());
  }

  public async findByUserId(userId: string): Promise<SetlistEntity[]> {
    return this.find({ where: { userId }, order: { createdAt: 'ASC' } });
  }
}
