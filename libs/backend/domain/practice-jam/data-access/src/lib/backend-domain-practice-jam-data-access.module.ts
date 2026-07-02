import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JamEntity } from './entity/jam.entity';
import { PhraseEntity } from './entity/phrase.entity';
import { SetlistEntity } from './entity/setlist.entity';
import { JamSetlistEntity } from './entity/jam-setlist.entity';
import { JamRepository } from './repo/jam.repository';
import { PhraseRepository } from './repo/phrase.repository';
import { SetlistRepository } from './repo/setlist.repository';
import { JamSetlistRepository } from './repo/jam-setlist.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JamEntity,
      PhraseEntity,
      SetlistEntity,
      JamSetlistEntity,
    ]),
  ],
  providers: [
    JamRepository,
    PhraseRepository,
    SetlistRepository,
    JamSetlistRepository,
  ],
  exports: [
    JamRepository,
    PhraseRepository,
    SetlistRepository,
    JamSetlistRepository,
  ],
})
export class BackendDomainPracticeJamDataAccessModule {}
