import { Module } from '@nestjs/common';
import { OpenAiApiService } from './service/open-ai-api.service';
import { ConfigService } from '@nestjs/config';
import { OpenAiController } from './controller/open-ai.controller';

@Module({
  controllers: [OpenAiController],
  providers: [OpenAiApiService, ConfigService],
  exports: [],
})
export class OpenAiApiModule {}
