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

  @Column({ nullable: true })
  public firstName!: string | null;

  @Column({ nullable: true })
  public lastName!: string | null;

  @Column({ nullable: true, select: false })
  public passwordHash!: string | null;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  public provider!: AuthProvider;

  @Column({ nullable: true })
  public googleId!: string | null;

  @Column({ default: false })
  public emailConfirmed!: boolean;

  @Column({ nullable: true })
  public emailConfirmToken!: string | null;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
