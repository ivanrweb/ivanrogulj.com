import { Module } from '@nestjs/common';
import { OrmModule } from '../../db/typeorm.module';
@Module({
  imports: [OrmModule]
})
export class BackendCoreConfigModule {}
