import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { JamEntity } from '../entity/jam.entity';

@Injectable()
export class JamRepository extends Repository<JamEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(JamEntity, dataSource.createEntityManager());
  }

  public async findByUserId(userId: string): Promise<JamEntity[]> {
    return this.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}
