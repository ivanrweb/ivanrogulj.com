import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('practice_jam_category_link')
export class JamCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public jamId!: string;

  @Column()
  public categoryId!: string;
}
