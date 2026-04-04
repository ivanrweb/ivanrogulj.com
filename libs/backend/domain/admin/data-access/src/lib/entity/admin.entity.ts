import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin')
export class AdminEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ unique: true })
  public username!: string;

  @Column()
  public passwordHash!: string;

  @CreateDateColumn()
  public createdAt!: Date;
}
