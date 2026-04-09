import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('analog_synth_patch_effects')
export class AnalogSynthPatchEffectsEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public patchId!: string;

  // Distortion
  @Column({ type: 'float' })
  public distortionAmount!: number;

  @Column({ type: 'float' })
  public distortionTone!: number;

  @Column({ type: 'float' })
  public distortionMix!: number;

  @Column()
  public distortionEnabled!: boolean;

  // Chorus
  @Column({ type: 'float' })
  public chorusRate!: number;

  @Column({ type: 'float' })
  public chorusDepth!: number;

  @Column({ type: 'float' })
  public chorusMix!: number;

  @Column()
  public chorusEnabled!: boolean;

  // Reverb
  @Column({ type: 'float' })
  public reverbMix!: number;

  @Column({ type: 'float' })
  public reverbDecay!: number;

  @Column()
  public reverbEnabled!: boolean;

  // Delay
  @Column({ type: 'float' })
  public delayTime!: number;

  @Column({ type: 'float' })
  public delayFeedback!: number;

  @Column({ type: 'float' })
  public delayMix!: number;

  @Column()
  public delayEnabled!: boolean;
}
