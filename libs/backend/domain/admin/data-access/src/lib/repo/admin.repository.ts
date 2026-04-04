import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AdminEntity } from '../entity/admin.entity';

@Injectable()
export class AdminRepository extends Repository<AdminEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(AdminEntity, dataSource.createEntityManager());
  }

  public async findByUsername(username: string): Promise<AdminEntity | null> {
    return this.createQueryBuilder('admin')
      .where('admin.username = :username', { username })
      .getOne();
  }

  public async existsAny(): Promise<boolean> {
    const count = await this.createQueryBuilder('admin').getCount();
    return count > 0;
  }
}
