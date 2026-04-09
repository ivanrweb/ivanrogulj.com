import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from '@ivanrogulj.com/shared/data-access/model';

@Injectable({ providedIn: 'root' })
export class ArticleApiService {
  private readonly http = inject(HttpClient);

  public getAll(): Observable<Omit<Article, 'content'>[]> {
    return this.http.get<Omit<Article, 'content'>[]>('/api/articles');
  }

  public getBySlug(slug: string): Observable<Article> {
    return this.http.get<Article>(`/api/articles/${slug}`);
  }
}
