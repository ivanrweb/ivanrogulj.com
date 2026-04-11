import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SongChordsEntity } from '../entity/song-chords.entity';

@Injectable()
export class SongChordsRepository extends Repository<SongChordsEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(SongChordsEntity, dataSource.createEntityManager());
  }

  public async findByUserId(userId: string): Promise<SongChordsEntity[]> {
    return this.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}
