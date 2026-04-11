import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AuthService } from '@ivanrogulj.com/auth';

export interface SongChordsListItem {
  id: string;
  title: string;
  createdAt: string;
}

export interface SongChordsDetail {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class SongChordsApiService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  public getMySongs(): Observable<SongChordsListItem[]> {
    return this.http.get<SongChordsListItem[]>('/api/song-chords/my', {
      headers: this.getAuthHeaders(),
    });
  }

  public saveSong(title: string, content: string): Observable<SongChordsListItem> {
    return this.http.post<SongChordsListItem>(
      '/api/song-chords',
      { title, content },
      { headers: this.getAuthHeaders() }
    );
  }

  public updateSong(id: string, title: string, content: string): Observable<SongChordsListItem> {
    return this.http.put<SongChordsListItem>(
      `/api/song-chords/${id}`,
      { title, content },
      { headers: this.getAuthHeaders() }
    );
  }

  public deleteSong(id: string): Observable<void> {
    return this.http.delete<void>(`/api/song-chords/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  public getSong(id: string): Observable<SongChordsDetail> {
    return this.http.get<SongChordsDetail>(`/api/song-chords/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
