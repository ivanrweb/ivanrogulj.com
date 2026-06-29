import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAiApiService } from './open-ai-api.service';
import { AnthropicApiService } from './anthropic-api.service';
import { AiProviderService } from './ai-provider.abstract';

export type AiProviderName = 'openai' | 'anthropic';

@Injectable()
export class AiProviderFactory {
  private readonly providers: Record<AiProviderName, AiProviderService>;

  constructor(
    private readonly openAiService: OpenAiApiService,
    private readonly anthropicService: AnthropicApiService
  ) {
    this.providers = {
      openai: this.openAiService,
      anthropic: this.anthropicService,
    };
  }

  public getProvider(name: AiProviderName): AiProviderService {
    const provider = this.providers[name];
    if (!provider) {
      throw new BadRequestException(`Unknown AI provider: ${name}`);
    }
    return provider;
  }
}
