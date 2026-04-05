import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article, ArticleCategory } from '@ivanrogulj.com/shared/data-access/model';

export interface CreateArticlePayload {
  title: string;
  content: string;
  category: ArticleCategory;
  published: boolean;
}

export interface UpdateArticlePayload {
  title?: string;
  content?: string;
  category?: ArticleCategory;
  published?: boolean;
}

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

  public create(payload: CreateArticlePayload): Observable<Article> {
    return this.http.post<Article>(this.baseUrl, payload);
  }

  public update(id: string, payload: UpdateArticlePayload): Observable<Article> {
    return this.http.put<Article>(`${this.baseUrl}/${id}`, payload);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
