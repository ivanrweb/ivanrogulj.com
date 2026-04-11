import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BackendCoreConfigModule } from '@ivanrogulj.com/backend/core/config';
import { BackendCoreAuthModule } from '@ivanrogulj.com/backend/core/auth';
import { BackendDomainAnalogSynthPatchApiModule } from '@ivanrogulj.com/backend/domain/analog-synth-patch/api';
import { BackendDomainArticleApiModule } from '@ivanrogulj.com/backend/domain/article/api';
import { OpenAiApiModule } from '@ivanrogulj.com/backend/core/open-ai/api';
import { BackendDomainUserApiModule } from '@ivanrogulj.com/backend/domain/user/api';

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
    BackendCoreConfigModule,
    BackendCoreAuthModule,
    BackendDomainAnalogSynthPatchApiModule,
    BackendDomainArticleApiModule,
    OpenAiApiModule,
    BackendDomainUserApiModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class BackendShellModule {}
