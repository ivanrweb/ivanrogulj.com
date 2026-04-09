import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AnalogSynthPatchEffectsEntity } from '../entity/analog-synth-patch-effects.entity';

@Injectable()
export class AnalogSynthPatchEffectsRepository extends Repository<AnalogSynthPatchEffectsEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(AnalogSynthPatchEffectsEntity, dataSource.createEntityManager());
  }

  public async findByPatchId(patchId: string): Promise<AnalogSynthPatchEffectsEntity | null> {
    return this.findOne({ where: { patchId } });
  }
}
