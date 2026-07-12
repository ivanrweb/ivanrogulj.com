import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

@Injectable({
  providedIn: 'root'
})
export class SynthPatchApiService {
  private synthPatchUrl = 'synth-patch';

  constructor(private httpClient: HttpClient) {
  }

  public generateAIPatch(patchDescription: string, provider: 'openai' | 'anthropic' = 'openai', headers?: HttpHeaders): Observable<AnalogSynthApi.FullSynthPatchJson> {
    return this.httpClient.post<AnalogSynthApi.FullSynthPatchJson>(
      `/api/${this.synthPatchUrl}/generate-ai-patch?provider=${provider}`,
      { description: patchDescription },
      { headers },
    );
  }
}
