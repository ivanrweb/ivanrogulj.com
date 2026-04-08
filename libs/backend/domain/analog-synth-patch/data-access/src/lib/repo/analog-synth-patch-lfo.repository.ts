import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AnalogSynthPatchLfoEntity } from '../entity/analog-synth-patch-lfo.entity';

@Injectable()
export class AnalogSynthPatchLfoRepository extends Repository<AnalogSynthPatchLfoEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(AnalogSynthPatchLfoEntity, dataSource.createEntityManager());
  }

  public async findByPatchId(patchId: string): Promise<AnalogSynthPatchLfoEntity[]> {
    return this.find({ where: { patchId }, order: { lfoIndex: 'ASC' } });
  }

  public async deleteByPatchId(patchId: string): Promise<void> {
    await this.delete({ patchId });
  }
}
