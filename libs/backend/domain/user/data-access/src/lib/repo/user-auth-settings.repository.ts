import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserAuthSettingsEntity } from '../entity/user-auth-settings.entity';

@Injectable()
export class UserAuthSettingsRepository extends Repository<UserAuthSettingsEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(UserAuthSettingsEntity, dataSource.createEntityManager());
  }

  public async getSettings(): Promise<UserAuthSettingsEntity> {
    let settings = await this.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = this.create({ id: 1, registrationEnabled: true });
      await this.save(settings);
    }
    return settings;
  }
}
