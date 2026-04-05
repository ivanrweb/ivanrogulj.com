import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article, ArticleCategory } from '@ivanrogulj.com/shared/data-access/model';

@Injectable({ providedIn: 'root' })
export class ArticleApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/articles';

  public getAll(category?: ArticleCategory): Observable<Article[]> {
    if (category) {
      return this.http.get<Article[]>(this.baseUrl, { params: { category } });
    }
    return this.http.get<Article[]>(this.baseUrl);
  }

  public getBySlug(slug: string): Observable<Article> {
    return this.http.get<Article>(`${this.baseUrl}/${slug}`);
  }
}
