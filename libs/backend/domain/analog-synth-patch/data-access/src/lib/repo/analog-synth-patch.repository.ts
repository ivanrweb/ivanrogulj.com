import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AnalogSynthPatchEntity } from '../entity/analog-synth-patch.entity';

@Injectable()
export class AnalogSynthPatchRepository extends Repository<AnalogSynthPatchEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(AnalogSynthPatchEntity, dataSource.createEntityManager());
  }

  public async findByUserId(userId: string): Promise<AnalogSynthPatchEntity[]> {
    return this.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  public async findPublic(): Promise<AnalogSynthPatchEntity[]> {
    return this.find({ where: { isPublic: true }, order: { createdAt: 'DESC' } });
  }
}
