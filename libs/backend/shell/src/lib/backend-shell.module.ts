import { Global, Module } from '@nestjs/common';
import { BackendCoreConfigModule } from '@ivanrogulj.com/backend/core/config';
import { BackendCoreAuthModule } from '@ivanrogulj.com/backend/core/auth';
import { BackendDomainAnalogSynthPatchDataAccessModule } from '@ivanrogulj.com/backend/domain/analog-synth-patch/data-access';
import { BackendDomainArticleApiModule } from '@ivanrogulj.com/backend/domain/article/api';
import { OpenAiApiModule } from '@ivanrogulj.com/backend/core/open-ai/api';

@Global()
@Module({
  imports: [
    BackendCoreConfigModule,
    BackendCoreAuthModule,
    BackendDomainAnalogSynthPatchDataAccessModule,
    BackendDomainArticleApiModule,
    OpenAiApiModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class BackendShellModule {}
