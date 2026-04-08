import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_auth_settings')
export class UserAuthSettingsEntity {
  @PrimaryColumn()
  public id!: number;

  @Column({ default: true })
  public registrationEnabled!: boolean;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
