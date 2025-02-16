import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

@Injectable()
export class OpenAiApiService {

  constructor(private configService: ConfigService) {
  }

  private openai = new OpenAI({
    apiKey: this.configService.get('OPENAI_API_KEY'),
  });

  private generatePatchPrompt = `You are expected to return only json format without any comments from your side, for example:\n
{ "attack": 0.2, "decay": 0.5, "sustain": 0.4, "release": 0.3 }\n
All values should be decimal numbers between 0.03 and 1.\n
You are provided with the following description, and based on that you search for matching parameters:\n`;

  public async generateSynthPatch(patchDescription: string): Promise<AnalogSynthApi.SynthPatch> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {"role": "user", "content": `${this.generatePatchPrompt} ${patchDescription}`},
        ],
      });

      // Extract and return the generated text
      console.log(response.choices[0]?.message?.content ?? '');

      return <AnalogSynthApi.SynthPatch>JSON.parse(response.choices[0]?.message?.content ?? '');
    } catch (error) {
      console.error("Error generating new synth patch:", error);
      throw new Error("Error generating new synth patch.");
    }
  }
}
