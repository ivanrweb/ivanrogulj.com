import { Module } from '@nestjs/common';
import { BackendShellModule } from '@ivanrogulj.com/backend/shell';

@Module({
  imports: [BackendShellModule],
})
export class AppModule {}
