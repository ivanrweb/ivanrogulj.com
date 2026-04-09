import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAiApiService } from './service/open-ai-api.service';
import { AnthropicApiService } from './service/anthropic-api.service';
import { AiProviderFactory } from './service/ai-provider.factory';
import { OpenAiController } from './controller/open-ai.controller';

@Module({
  controllers: [OpenAiController],
  providers: [ConfigService, OpenAiApiService, AnthropicApiService, AiProviderFactory],
  exports: [],
})
export class OpenAiApiModule {}
