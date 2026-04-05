import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ArticleCategory } from '@ivanrogulj.com/shared/data-access/model';

@Entity('article')
export class ArticleEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public title!: string;

  @Column({ unique: true })
  public slug!: string;

  @Column({ type: 'text' })
  public content!: string;

  @Column({ type: 'enum', enum: ArticleCategory })
  public category!: ArticleCategory;

  @Column({ default: false })
  public published!: boolean;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
