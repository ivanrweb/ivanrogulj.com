import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AuditEventType {
  REGISTRATION_ATTEMPT = 'REGISTRATION_ATTEMPT',
  REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS',
  REGISTRATION_DISABLED = 'REGISTRATION_DISABLED',
  EMAIL_CONFIRMED = 'EMAIL_CONFIRMED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  GOOGLE_AUTH_SUCCESS = 'GOOGLE_AUTH_SUCCESS',
}

@Entity('audit_log')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'enum', enum: AuditEventType })
  public event!: AuditEventType;

  @Column({ nullable: true })
  public userId!: string | null;

  @Column({ nullable: true })
  public email!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  public meta!: Record<string, unknown> | null;

  @CreateDateColumn()
  public createdAt!: Date;
}
