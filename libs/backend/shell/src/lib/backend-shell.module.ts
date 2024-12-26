import { Global, Module } from '@nestjs/common';
import { BackendCoreConfigModule } from '@ivanrogulj.com/backend/core/config';

@Global()
@Module({
  imports: [
    BackendCoreConfigModule
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class BackendShellModule {}
