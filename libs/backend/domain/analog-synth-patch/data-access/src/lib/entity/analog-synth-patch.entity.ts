import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('analog_synth_patch')
export class AnalogSynthPatchEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string | undefined;

  @Column({nullable: true })
  public attack: number | undefined;
}
