import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { jsonColumnTransformer } from '@ivanrogulj.com/backend/core/config';

@Entity('analog_synth_patch_sequencer')
export class AnalogSynthPatchSequencerEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public patchId!: string;

  @Column({ type: 'float' })
  public bpm!: number;

  @Column()
  public rowCount!: number;

  @Column({ type: 'longtext', transformer: jsonColumnTransformer })
  public steps!: Array<{ active: boolean; note: number; velocity: number }>;
}
