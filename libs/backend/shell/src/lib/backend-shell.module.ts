import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { BackendCoreConfigModule } from '@ivanrogulj.com/backend/core/config';
import { BackendCoreAuthModule } from '@ivanrogulj.com/backend/core/auth';
import { BackendDomainAnalogSynthPatchApiModule } from '@ivanrogulj.com/backend/domain/analog-synth-patch/api';
import { BackendDomainArticleApiModule } from '@ivanrogulj.com/backend/domain/article/api';
import { OpenAiApiModule } from '@ivanrogulj.com/backend/core/open-ai/api';
import { BackendDomainUserApiModule } from '@ivanrogulj.com/backend/domain/user/api';
import { BackendDomainSongChordsApiModule } from '@ivanrogulj.com/backend/domain/song-chords/api';
import { BackendDomainJaminiApiModule } from '@ivanrogulj.com/backend/domain/jamini/api';

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
    // Single, app-wide throttler registration. @nestjs/throttler's ThrottlerModule is
    // @Global(), so calling forRoot() more than once anywhere in the app causes later
    // registrations to silently overwrite earlier ones on the shared THROTTLER_OPTIONS
    // token — all named buckets must be declared here, once, and scoped per-controller
    // via @SkipThrottle().
    ThrottlerModule.forRoot([
      { name: 'auth', ttl: 60000, limit: 2 },
      { name: 'auth-daily', ttl: 86400000, limit: 10 },
      { name: 'ai-short', ttl: 60000, limit: 2 },
      { name: 'ai-daily', ttl: 86400000, limit: 10 },
      { name: 'newsletter', ttl: 60000, limit: 5 },
      { name: 'newsletter-daily', ttl: 86400000, limit: 10 },
    ]),
    BackendCoreConfigModule,
    BackendCoreAuthModule,
    BackendDomainAnalogSynthPatchApiModule,
    BackendDomainArticleApiModule,
    OpenAiApiModule,
    BackendDomainUserApiModule,
    BackendDomainSongChordsApiModule,
    BackendDomainJaminiApiModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class BackendShellModule {}
