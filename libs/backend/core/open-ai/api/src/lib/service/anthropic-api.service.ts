import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
import { AiProviderService } from './ai-provider.abstract';
import { GENERATE_PATCH_PROMPT } from '../util/synth-patch-prompt';

@Injectable()
export class AnthropicApiService extends AiProviderService {
  private readonly anthropic: Anthropic;

  constructor(private readonly configService: ConfigService) {
    super();
    this.anthropic = new Anthropic({
      apiKey: this.configService.get('ANTHROPIC_API_KEY'),
    });
  }

  public async generateSynthPatch(
    description: string
  ): Promise<AnalogSynthApi.FullSynthPatchJson> {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [
          { role: 'user', content: `${GENERATE_PATCH_PROMPT}${description}` },
        ],
      });

      const block = response.content[0];
      const content = block.type === 'text' ? block.text : '';
      return JSON.parse(content) as AnalogSynthApi.FullSynthPatchJson;
    } catch (error) {
      console.error('Anthropic: error generating synth patch:', error);
      throw new Error('Error generating synth patch via Anthropic.');
    }
  }
}
