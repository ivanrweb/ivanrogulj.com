import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('practice_jam_setlist')
export class SetlistEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public userId!: string;

  @Column()
  public name!: string;

  @CreateDateColumn()
  public createdAt!: Date;
}
