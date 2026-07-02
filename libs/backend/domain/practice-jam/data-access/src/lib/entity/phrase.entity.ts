import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('practice_jam_phrase')
export class PhraseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public jamId!: string;

  @Column()
  public name!: string;

  @Column({ type: 'float' })
  public startSeconds!: number;

  @Column({ type: 'float' })
  public endSeconds!: number;

  @Column({ type: 'float', default: 1 })
  public playbackRate!: number;

  @Column({ type: 'int', default: 0 })
  public sortOrder!: number;

  @CreateDateColumn()
  public createdAt!: Date;
}
