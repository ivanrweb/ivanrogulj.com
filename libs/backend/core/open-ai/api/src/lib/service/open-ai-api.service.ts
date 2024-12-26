import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenAiApiService {

  constructor(private configService: ConfigService) {
  }

  public openai = new OpenAI({
    apiKey: this.configService.get('OPENAI_API_KEY'),
  });

  public async createSynthPatch(): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {"role": "user", "content": "write a haiku about ai"},
        ],
      });

      // Extract and return the generated text
      return response.choices[0]?.message?.content || "No haiku generated";
    } catch (error) {
      console.error("Error generating haiku:", error);
      throw new Error("Failed to generate haiku");
    }
  }
}
