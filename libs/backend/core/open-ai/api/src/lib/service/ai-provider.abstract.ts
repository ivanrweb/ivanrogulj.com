import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

export abstract class AiProviderService {
  public abstract generateSynthPatch(description: string): Promise<AnalogSynthApi.FullSynthPatchJson>;
}
