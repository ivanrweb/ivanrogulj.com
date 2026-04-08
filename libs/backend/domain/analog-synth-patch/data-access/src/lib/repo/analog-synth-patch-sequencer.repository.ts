import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AnalogSynthPatchSequencerEntity } from '../entity/analog-synth-patch-sequencer.entity';

@Injectable()
export class AnalogSynthPatchSequencerRepository extends Repository<AnalogSynthPatchSequencerEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(AnalogSynthPatchSequencerEntity, dataSource.createEntityManager());
  }

  public async findByPatchId(patchId: string): Promise<AnalogSynthPatchSequencerEntity | null> {
    return this.findOne({ where: { patchId } });
  }
}
