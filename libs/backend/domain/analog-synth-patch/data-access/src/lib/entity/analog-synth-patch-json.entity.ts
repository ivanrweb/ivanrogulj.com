import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

@Entity('analog_synth_patch_json')
export class AnalogSynthPatchJsonEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ unique: true })
  public patchId!: string;

  @Column({ type: 'json' })
  public patchJson!: AnalogSynthApi.FullSynthPatchJson;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
