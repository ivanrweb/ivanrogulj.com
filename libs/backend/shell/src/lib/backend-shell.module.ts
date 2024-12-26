import { Global, Module } from '@nestjs/common';
import { BackendCoreConfigModule } from '@ivanrogulj.com/backend/core/config';
import {
  BackendDomainAnalogSynthPatchDataAccessModule
} from '@ivanrogulj.com/backend/domain/analog-synth-patch/data-access';
import { OpenAiApiModule } from '@ivanrogulj.com/backend/core/open-ai/api';

@Global()
@Module({
  imports: [
    BackendCoreConfigModule,
    BackendDomainAnalogSynthPatchDataAccessModule,
    OpenAiApiModule
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class BackendShellModule {}
