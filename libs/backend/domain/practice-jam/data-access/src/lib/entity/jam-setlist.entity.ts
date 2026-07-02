import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('practice_jam_setlist_link')
export class JamSetlistEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public jamId!: string;

  @Column()
  public setlistId!: string;
}
