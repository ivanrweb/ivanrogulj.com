import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JamEntity } from './entity/jam.entity';
import { PhraseEntity } from './entity/phrase.entity';
import { CategoryEntity } from './entity/category.entity';
import { JamCategoryEntity } from './entity/jam-category.entity';
import { JamRepository } from './repo/jam.repository';
import { PhraseRepository } from './repo/phrase.repository';
import { CategoryRepository } from './repo/category.repository';
import { JamCategoryRepository } from './repo/jam-category.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JamEntity,
      PhraseEntity,
      CategoryEntity,
      JamCategoryEntity,
    ]),
  ],
  providers: [
    JamRepository,
    PhraseRepository,
    CategoryRepository,
    JamCategoryRepository,
  ],
  exports: [
    JamRepository,
    PhraseRepository,
    CategoryRepository,
    JamCategoryRepository,
  ],
})
export class BackendDomainPracticeJamDataAccessModule {}
