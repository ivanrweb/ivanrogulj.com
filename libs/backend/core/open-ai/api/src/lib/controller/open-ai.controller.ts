import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { AiProviderFactory, AiProviderName } from '../service/ai-provider.factory';
import { GeneratePatchDto } from '../dto/generate-patch.dto';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { JwtAuthGuard } from '@ivanrogulj.com/backend/core/auth';

@Controller('synth-patch')
@SkipThrottle({ auth: true, 'auth-daily': true, newsletter: true, 'newsletter-daily': true })
export class OpenAiController {
  public constructor(private readonly aiProviderFactory: AiProviderFactory) {}

  @Post('generate-ai-patch')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  public async generateSynthPatch(
    @Body() body: GeneratePatchDto,
    @Query('provider') provider: AiProviderName = 'openai',
  ): Promise<AnalogSynthApi.FullSynthPatchJson> {
    return this.aiProviderFactory.getProvider(provider).generateSynthPatch(body.description);
  }
}
