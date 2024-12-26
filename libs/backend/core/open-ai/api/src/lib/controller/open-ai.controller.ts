import { Body, Controller, Post } from '@nestjs/common';
import { OpenAiApiService } from '../service/open-ai-api.service';

@Controller('synth-patch')
export class OpenAiController {
  constructor(private openAiApiService: OpenAiApiService) {
  }

  @Post('generate-ai-patch')
  public async generateSynthPatch(@Body() patchDescription: string): Promise<void> {
    return this.openAiApiService.generateSynthPatch(patchDescription);
  }
}
