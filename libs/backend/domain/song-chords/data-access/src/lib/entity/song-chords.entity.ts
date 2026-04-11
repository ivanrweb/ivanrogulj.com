import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('song_chords')
export class SongChordsEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public userId!: string;

  @Column()
  public title!: string;

  @Column({ type: 'text' })
  public content!: string;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
