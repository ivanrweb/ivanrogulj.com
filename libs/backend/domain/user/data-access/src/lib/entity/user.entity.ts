import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ unique: true })
  public email!: string;

  @Column({ nullable: true, length: 100 })
  public firstName!: string | null;

  @Column({ nullable: true, length: 100 })
  public lastName!: string | null;

  @Column({ nullable: true, select: false, length: 64 })
  public passwordHash!: string | null;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  public provider!: AuthProvider;

  @Column({ nullable: true, length: 64 })
  public googleId!: string | null;

  @Column({ default: false })
  public emailConfirmed!: boolean;

  @Column({ nullable: true, length: 40 })
  public emailConfirmToken!: string | null;

  @Column({ default: true })
  public subscribedToNewsletter!: boolean;

  @Column({ nullable: true, unique: true, length: 40 })
  public newsletterUnsubscribeToken!: string | null;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
