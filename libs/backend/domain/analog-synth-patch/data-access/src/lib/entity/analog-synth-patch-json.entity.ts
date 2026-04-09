import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AnalogSynthPatchEntity } from './analog-synth-patch.entity';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

@Entity('analog_synth_patch_json')
export class AnalogSynthPatchJsonEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ unique: true })
  public patchId!: string;

  @OneToOne(() => AnalogSynthPatchEntity)
  @JoinColumn({ name: 'patchId' })
  public patch!: AnalogSynthPatchEntity;

  @Column({ type: 'jsonb' })
  public patchJson!: AnalogSynthApi.FullSynthPatchJson;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
