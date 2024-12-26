import { Global, Module } from '@nestjs/common';
import { BackendCoreConfigModule } from '@ivanrogulj.com/backend/core/config';
import {
  BackendDomainAnalogSynthPatchDataAccessModule
} from '@ivanrogulj.com/backend/domain/analog-synth-patch/data-access';

@Global()
@Module({
  imports: [
    BackendCoreConfigModule,
    BackendDomainAnalogSynthPatchDataAccessModule
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class BackendShellModule {}
