import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

@Injectable({
  providedIn: 'root'
})
export class SynthPatchApiService {
  private BASE_URL = 'http://localhost:3000/api';
  private synthPatchUrl = 'synth-patch';

  constructor(private httpClient: HttpClient) {
  }

  public generateAIPatch(patchDescription: string): Observable<AnalogSynthApi.SynthPatch> {
    return this.httpClient.post<AnalogSynthApi.SynthPatch>(`${this.BASE_URL}/${this.synthPatchUrl}/generate-ai-patch`, patchDescription);
  }
}
