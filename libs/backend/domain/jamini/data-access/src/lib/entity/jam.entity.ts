import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('jamini_jam')
export class JamEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public userId!: string;

  @Column()
  public name!: string;

  @Column()
  public youtubeVideoId!: string;

  @Column()
  public youtubeUrl!: string;

  @Column({ type: 'float', nullable: true, default: null })
  public durationSeconds!: number | null;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
