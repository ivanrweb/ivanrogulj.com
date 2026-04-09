import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('analog_synth_patch_lfo')
export class AnalogSynthPatchLfoEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public patchId!: string;

  @Column()
  public lfoIndex!: number;

  @Column({ type: 'float' })
  public rate!: number;

  @Column({ type: 'float' })
  public depth!: number;

  @Column()
  public waveform!: string;

  @Column()
  public destination!: string;

  @Column()
  public keySync!: boolean;

  @Column()
  public enabled!: boolean;
}
