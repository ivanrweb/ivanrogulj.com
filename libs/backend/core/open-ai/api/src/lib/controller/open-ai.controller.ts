import { Body, Controller, Post, Query } from '@nestjs/common';
import { AiProviderFactory, AiProviderName } from '../service/ai-provider.factory';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

@Controller('synth-patch')
export class OpenAiController {
  public constructor(private readonly aiProviderFactory: AiProviderFactory) {}

  @Post('generate-ai-patch')
  public async generateSynthPatch(
    @Body() body: { description: string },
    @Query('provider') provider: AiProviderName = 'openai',
  ): Promise<AnalogSynthApi.FullSynthPatchJson> {
    return this.aiProviderFactory.getProvider(provider).generateSynthPatch(body.description);
  }
}
