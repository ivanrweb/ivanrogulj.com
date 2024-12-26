import { Controller, Get } from '@nestjs/common';
import { OpenAiApiService } from '../service/open-ai-api.service';

@Controller('open-ai')
export class OpenAiController {
  constructor(private openAiApiService: OpenAiApiService) {
  }

  @Get('get-message')
  public async testCommunication(): Promise<string> {
    return this.openAiApiService.createSynthPatch();
  }
}
