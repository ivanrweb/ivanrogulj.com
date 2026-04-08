import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserAuthSettingsEntity } from './entity/user-auth-settings.entity';
import { AuditLogEntity } from './entity/audit-log.entity';
import { UserRepository } from './repo/user.repository';
import { UserAuthSettingsRepository } from './repo/user-auth-settings.repository';
import { AuditLogRepository } from './repo/audit-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserAuthSettingsEntity, AuditLogEntity])],
  providers: [UserRepository, UserAuthSettingsRepository, AuditLogRepository],
  exports: [UserRepository, UserAuthSettingsRepository, AuditLogRepository],
})
export class BackendDomainUserDataAccessModule {}
