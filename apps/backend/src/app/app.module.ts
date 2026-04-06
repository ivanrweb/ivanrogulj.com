import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BackendShellModule } from '@ivanrogulj.com/backend/shell';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BackendShellModule,
  ],
})
export class AppModule {}
