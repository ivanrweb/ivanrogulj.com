import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ type: 'json' })
  public steps!: Array<{ active: boolean; note: number; velocity: number }>;
}
