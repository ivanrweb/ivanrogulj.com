import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AnalogSynthPatchEntity } from '../entity/analog-synth-patch.entity';

@Injectable()
export class AnalogSynthPatchRepository extends Repository<AnalogSynthPatchEntity> {
  constructor(private dataSource: DataSource) {
    super(AnalogSynthPatchEntity, dataSource.createEntityManager());
  }
}
