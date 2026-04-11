import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongChordsEntity } from './entity/song-chords.entity';
import { SongChordsRepository } from './repo/song-chords.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SongChordsEntity])],
  providers: [SongChordsRepository],
  exports: [SongChordsRepository],
})
export class BackendDomainSongChordsDataAccessModule {}
