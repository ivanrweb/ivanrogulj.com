import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AiProviderFactory, AiProviderName } from '../service/ai-provider.factory';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { JwtAuthGuard } from '@ivanrogulj.com/backend/core/auth';

@Controller('synth-patch')
export class OpenAiController {
  public constructor(private readonly aiProviderFactory: AiProviderFactory) {}

  @Post('generate-ai-patch')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  public async generateSynthPatch(
    @Body() body: { description: string },
    @Query('provider') provider: AiProviderName = 'openai',
  ): Promise<AnalogSynthApi.FullSynthPatchJson> {
    return this.aiProviderFactory.getProvider(provider).generateSynthPatch(body.description);
  }
}
