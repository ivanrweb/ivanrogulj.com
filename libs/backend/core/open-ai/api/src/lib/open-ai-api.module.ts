import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { OpenAiApiService } from './service/open-ai-api.service';
import { AnthropicApiService } from './service/anthropic-api.service';
import { AiProviderFactory } from './service/ai-provider.factory';
import { OpenAiController } from './controller/open-ai.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60000, limit: 2 },
      { name: 'daily', ttl: 86400000, limit: 10 },
    ]),
  ],
  controllers: [OpenAiController],
  providers: [
    ConfigService,
    OpenAiApiService,
    AnthropicApiService,
    AiProviderFactory,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  exports: [],
})
export class OpenAiApiModule {}
