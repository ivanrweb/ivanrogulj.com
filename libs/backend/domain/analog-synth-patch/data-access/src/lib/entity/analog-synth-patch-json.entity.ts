import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
import { jsonColumnTransformer } from '@ivanrogulj.com/backend/core/config';

@Entity('analog_synth_patch_json')
export class AnalogSynthPatchJsonEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ unique: true })
  public patchId!: string;

  @Column({ type: 'longtext', transformer: jsonColumnTransformer })
  public patchJson!: AnalogSynthApi.FullSynthPatchJson;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
