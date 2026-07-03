import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AuthService } from '@ivanrogulj.com/auth';
import { JaminiApi } from '@ivanrogulj.com/shared/data-access/model';

@Injectable({ providedIn: 'root' })
export class JaminiApiService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  public createJam(payload: JaminiApi.CreateJamPayload): Observable<JaminiApi.JamListItem> {
    return this.http.post<JaminiApi.JamListItem>('/api/jamini/jams', payload, {
      headers: this.getAuthHeaders(),
    });
  }

  public getJams(): Observable<JaminiApi.JamListItem[]> {
    return this.http.get<JaminiApi.JamListItem[]>('/api/jamini/jams', {
      headers: this.getAuthHeaders(),
    });
  }

  public getJam(id: string): Observable<JaminiApi.JamDetail> {
    return this.http.get<JaminiApi.JamDetail>(`/api/jamini/jams/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  public updateJam(id: string, payload: JaminiApi.UpdateJamPayload): Observable<JaminiApi.JamListItem> {
    return this.http.put<JaminiApi.JamListItem>(`/api/jamini/jams/${id}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  public deleteJam(id: string): Observable<void> {
    return this.http.delete<void>(`/api/jamini/jams/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  public setJamCategories(id: string, categoryIds: string[]): Observable<string[]> {
    return this.http.put<string[]>(
      `/api/jamini/jams/${id}/categories`,
      { categoryIds },
      { headers: this.getAuthHeaders() },
    );
  }

  public addLick(jamId: string, payload: JaminiApi.SaveLickPayload): Observable<JaminiApi.Lick> {
    return this.http.post<JaminiApi.Lick>(`/api/jamini/jams/${jamId}/licks`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  public updateLick(id: string, payload: JaminiApi.SaveLickPayload): Observable<JaminiApi.Lick> {
    return this.http.put<JaminiApi.Lick>(`/api/jamini/licks/${id}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  public deleteLick(id: string): Observable<void> {
    return this.http.delete<void>(`/api/jamini/licks/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  public getCategories(): Observable<JaminiApi.Category[]> {
    return this.http.get<JaminiApi.Category[]>('/api/jamini/categories', {
      headers: this.getAuthHeaders(),
    });
  }

  public createCategory(name: string): Observable<JaminiApi.Category> {
    return this.http.post<JaminiApi.Category>(
      '/api/jamini/categories',
      { name },
      { headers: this.getAuthHeaders() },
    );
  }

  public renameCategory(id: string, name: string): Observable<JaminiApi.Category> {
    return this.http.put<JaminiApi.Category>(
      `/api/jamini/categories/${id}`,
      { name },
      { headers: this.getAuthHeaders() },
    );
  }

  public deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`/api/jamini/categories/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
