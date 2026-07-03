import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('jamini_category')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public userId!: string;

  @Column()
  public name!: string;

  @CreateDateColumn()
  public createdAt!: Date;
}
