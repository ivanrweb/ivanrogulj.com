import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuditLogEntity, AuditEventType } from '../entity/audit-log.entity';

@Injectable()
export class AuditLogRepository extends Repository<AuditLogEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(AuditLogEntity, dataSource.createEntityManager());
  }

  public async countRecentRegistrationAttempts(sinceMs: number): Promise<number> {
    const since = new Date(Date.now() - sinceMs);
    return this.createQueryBuilder('log')
      .where('log.event = :event', { event: AuditEventType.REGISTRATION_ATTEMPT })
      .andWhere('log.createdAt >= :since', { since })
      .getCount();
  }

  public async log(
    event: AuditEventType,
    partial: Partial<Pick<AuditLogEntity, 'userId' | 'email' | 'meta'>>,
  ): Promise<void> {
    const entry = this.create({ event, ...partial });
    await this.save(entry);
  }
}
