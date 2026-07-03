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

  public setJamCategories(id: string, categoryIds: string[]): Observable<string[]> {
    return this.http.put<string[]>(
      `/api/practice-jam/jams/${id}/categories`,
      { categoryIds },
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

  public getCategories(): Observable<PracticeJamApi.Category[]> {
    return this.http.get<PracticeJamApi.Category[]>('/api/practice-jam/categories', {
      headers: this.getAuthHeaders(),
    });
  }

  public createCategory(name: string): Observable<PracticeJamApi.Category> {
    return this.http.post<PracticeJamApi.Category>(
      '/api/practice-jam/categories',
      { name },
      { headers: this.getAuthHeaders() },
    );
  }

  public renameCategory(id: string, name: string): Observable<PracticeJamApi.Category> {
    return this.http.put<PracticeJamApi.Category>(
      `/api/practice-jam/categories/${id}`,
      { name },
      { headers: this.getAuthHeaders() },
    );
  }

  public deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`/api/practice-jam/categories/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
