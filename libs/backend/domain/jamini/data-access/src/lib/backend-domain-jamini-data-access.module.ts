import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JamEntity } from './entity/jam.entity';
import { LickEntity } from './entity/lick.entity';
import { CategoryEntity } from './entity/category.entity';
import { JamCategoryEntity } from './entity/jam-category.entity';
import { JamRepository } from './repo/jam.repository';
import { LickRepository } from './repo/lick.repository';
import { CategoryRepository } from './repo/category.repository';
import { JamCategoryRepository } from './repo/jam-category.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JamEntity,
      LickEntity,
      CategoryEntity,
      JamCategoryEntity,
    ]),
  ],
  providers: [
    JamRepository,
    LickRepository,
    CategoryRepository,
    JamCategoryRepository,
  ],
  exports: [
    JamRepository,
    LickRepository,
    CategoryRepository,
    JamCategoryRepository,
  ],
})
export class BackendDomainJaminiDataAccessModule {}
