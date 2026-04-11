import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BackendDomainSongChordsDataAccessModule } from '@ivanrogulj.com/backend/domain/song-chords/data-access';
import { SongChordsService } from './song-chords.service';
import { SongChordsController } from './song-chords.controller';
import { SongChordsAuthGuard } from './guards/song-chords-auth.guard';

@Module({
  imports: [
    ConfigModule,
    BackendDomainSongChordsDataAccessModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'default-secret',
      }),
    }),
  ],
  controllers: [SongChordsController],
  providers: [SongChordsService, SongChordsAuthGuard],
})
export class BackendDomainSongChordsApiModule {}
