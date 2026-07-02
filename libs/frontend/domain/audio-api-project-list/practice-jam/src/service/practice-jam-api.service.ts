import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AuthService } from '@ivanrogulj.com/auth';
import { PracticeJamApi } from '@ivanrogulj.com/shared/data-access/model';

@Injectable({ providedIn: 'root' })
export class PracticeJamApiService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  public createJam(payload: PracticeJamApi.CreateJamPayload): Observable<PracticeJamApi.JamListItem> {
    return this.http.post<PracticeJamApi.JamListItem>('/api/practice-jam/jams', payload, {
      headers: this.getAuthHeaders(),
    });
  }

  public getJams(): Observable<PracticeJamApi.JamListItem[]> {
    return this.http.get<PracticeJamApi.JamListItem[]>('/api/practice-jam/jams', {
      headers: this.getAuthHeaders(),
    });
  }

  public getJam(id: string): Observable<PracticeJamApi.JamDetail> {
    return this.http.get<PracticeJamApi.JamDetail>(`/api/practice-jam/jams/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  public updateJam(id: string, payload: PracticeJamApi.UpdateJamPayload): Observable<PracticeJamApi.JamListItem> {
    return this.http.put<PracticeJamApi.JamListItem>(`/api/practice-jam/jams/${id}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  public deleteJam(id: string): Observable<void> {
    return this.http.delete<void>(`/api/practice-jam/jams/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  public setJamSetlists(id: string, setlistIds: string[]): Observable<string[]> {
    return this.http.put<string[]>(
      `/api/practice-jam/jams/${id}/setlists`,
      { setlistIds },
      { headers: this.getAuthHeaders() },
    );
  }

  public addPhrase(jamId: string, payload: PracticeJamApi.SavePhrasePayload): Observable<PracticeJamApi.Phrase> {
    return this.http.post<PracticeJamApi.Phrase>(`/api/practice-jam/jams/${jamId}/phrases`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  public updatePhrase(id: string, payload: PracticeJamApi.SavePhrasePayload): Observable<PracticeJamApi.Phrase> {
    return this.http.put<PracticeJamApi.Phrase>(`/api/practice-jam/phrases/${id}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  public deletePhrase(id: string): Observable<void> {
    return this.http.delete<void>(`/api/practice-jam/phrases/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  public getSetlists(): Observable<PracticeJamApi.Setlist[]> {
    return this.http.get<PracticeJamApi.Setlist[]>('/api/practice-jam/setlists', {
      headers: this.getAuthHeaders(),
    });
  }

  public createSetlist(name: string): Observable<PracticeJamApi.Setlist> {
    return this.http.post<PracticeJamApi.Setlist>(
      '/api/practice-jam/setlists',
      { name },
      { headers: this.getAuthHeaders() },
    );
  }

  public renameSetlist(id: string, name: string): Observable<PracticeJamApi.Setlist> {
    return this.http.put<PracticeJamApi.Setlist>(
      `/api/practice-jam/setlists/${id}`,
      { name },
      { headers: this.getAuthHeaders() },
    );
  }

  public deleteSetlist(id: string): Observable<void> {
    return this.http.delete<void>(`/api/practice-jam/setlists/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
