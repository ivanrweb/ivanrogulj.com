import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('notified_article')
export class NotifiedArticleEntity {
  @PrimaryColumn()
  public mediumArticleId!: string;

  @CreateDateColumn()
  public notifiedAt!: Date;
}
