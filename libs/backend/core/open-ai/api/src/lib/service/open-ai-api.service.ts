import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
import { AiProviderService } from './ai-provider.abstract';
import { GENERATE_PATCH_PROMPT } from '../util/synth-patch-prompt';

@Injectable()
export class OpenAiApiService extends AiProviderService {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    super();
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  public async generateSynthPatch(
    description: string
  ): Promise<AnalogSynthApi.FullSynthPatchJson> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-5.4-nano',
        max_tokens: 2048,
        messages: [
          { role: 'user', content: `${GENERATE_PATCH_PROMPT}${description}` },
        ],
      });

      const content = response.choices[0]?.message?.content ?? '';
      return JSON.parse(content) as AnalogSynthApi.FullSynthPatchJson;
    } catch (error) {
      console.error('OpenAI: error generating synth patch:', error);
      throw new Error('Error generating synth patch via OpenAI.');
    }
  }
}
