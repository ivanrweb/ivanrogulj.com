import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AnalogSynthPatchJsonEntity } from '../entity/analog-synth-patch-json.entity';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

@Injectable()
export class AnalogSynthPatchJsonRepository extends Repository<AnalogSynthPatchJsonEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(AnalogSynthPatchJsonEntity, dataSource.createEntityManager());
  }

  public async upsertByPatchId(patchId: string, patchJson: AnalogSynthApi.FullSynthPatchJson): Promise<void> {
    await this.upsert({ patchId, patchJson }, ['patchId']);
  }

  public async findByPatchId(patchId: string): Promise<AnalogSynthPatchJsonEntity | null> {
    return this.findOne({ where: { patchId } });
  }
}
