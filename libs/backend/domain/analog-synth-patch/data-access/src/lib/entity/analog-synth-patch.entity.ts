import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('analog_synth_patch')
export class AnalogSynthPatchEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public userId!: string;

  @Column()
  public name!: string;

  @Column({ default: false })
  public isPublic!: boolean;

  // Oscillator
  @Column()
  public oscType!: string;

  @Column()
  public oscillatorCount!: number;

  @Column({ type: 'float' })
  public detuneAmount!: number;

  @Column()
  public isPolyphonic!: boolean;

  // Noise
  @Column()
  public noiseType!: string;

  @Column({ type: 'float' })
  public noiseVolume!: number;

  // Master
  @Column({ type: 'float' })
  public masterGain!: number;

  // Filter
  @Column({ type: 'float' })
  public filterFrequency!: number;

  @Column({ type: 'float' })
  public filterResonance!: number;

  @Column({ type: 'float' })
  public filterEnvelopeAmount!: number;

  // Volume ADSR
  @Column({ type: 'float' })
  public volAttack!: number;

  @Column({ type: 'float' })
  public volDecay!: number;

  @Column({ type: 'float' })
  public volSustain!: number;

  @Column({ type: 'float' })
  public volRelease!: number;

  // Filter ADSR
  @Column({ type: 'float' })
  public filterAttack!: number;

  @Column({ type: 'float' })
  public filterDecay!: number;

  @Column({ type: 'float' })
  public filterSustain!: number;

  @Column({ type: 'float' })
  public filterRelease!: number;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
