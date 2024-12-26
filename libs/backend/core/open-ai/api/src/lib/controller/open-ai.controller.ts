import { Body, Controller, Post } from '@nestjs/common';
import { OpenAiApiService } from '../service/open-ai-api.service';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

@Controller('synth-patch')
export class OpenAiController {
  constructor(private openAiApiService: OpenAiApiService) {
  }

  @Post('generate-ai-patch')
  public async generateSynthPatch(@Body() patchDescription: string): Promise<AnalogSynthApi.SynthPatch> {
    return this.openAiApiService.generateSynthPatch(patchDescription);
  }
}
