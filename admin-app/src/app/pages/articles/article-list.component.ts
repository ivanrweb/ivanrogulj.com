import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { Article } from '@ivanrogulj.com/shared/data-access/model';
import { ArticleApiService } from '../../services/article-api.service';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  template: `
    <div class="page">
      <header class="header">
        <div class="header-left">
          <a routerLink="/dashboard" class="back-link">← Dashboard</a>
          <h1>Articles</h1>
        </div>
        <a routerLink="/articles/new" class="btn btn-primary">New Article</a>
      </header>
      <main class="content">
        @if (loading()) {
          <p class="loading">Loading...</p>
        } @else if (articles().length === 0) {
          <p class="empty">
            No articles yet. <a routerLink="/articles/new">Create one.</a>
          </p>
        } @else {
          <table class="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Published</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (article of articles(); track article.id) {
                <tr>
                  <td>{{ article.title }}</td>
                  <td><span class="badge">{{ article.category }}</span></td>
                  <td>
                    @if (article.published) {
                      <span class="status published">Yes</span>
                    } @else {
                      <span class="status draft">Draft</span>
                    }
                  </td>
                  <td>{{ article.createdAt | slice: 0 : 10 }}</td>
                  <td class="actions">
                    <a
                      [routerLink]="['/articles/edit', article.id]"
                      class="btn-sm btn-edit"
                      >Edit</a
                    >
                    <button class="btn-sm btn-delete" (click)="delete(article)">
                      Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </main>
    </div>
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        background: #1a1a2e;
        color: #e2e8f0;
      }
      .header {
        background: #16213e;
        padding: 1.25rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #334155;
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }
      .back-link {
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.9rem;
        &:hover {
          color: #e2e8f0;
        }
      }
      h1 {
        margin: 0;
        font-size: 1.25rem;
      }
      .content {
        padding: 2rem;
        max-width: 1000px;
        margin: 0 auto;
      }
      .loading,
      .empty {
        color: #94a3b8;
      }
      .empty a {
        color: #6366f1;
      }
      .table {
        width: 100%;
        border-collapse: collapse;
        background: #16213e;
        border-radius: 10px;
        overflow: hidden;
        th {
          background: #0f3460;
          padding: 0.875rem 1rem;
          text-align: left;
          color: #94a3b8;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #1e293b;
          color: #e2e8f0;
        }
        tr:last-child td {
          border-bottom: none;
        }
      }
      .badge {
        background: #0f3460;
        padding: 0.25rem 0.6rem;
        border-radius: 4px;
        font-size: 0.75rem;
        color: #94a3b8;
      }
      .status {
        font-size: 0.8rem;
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
      }
      .published {
        background: #166534;
        color: #86efac;
      }
      .draft {
        background: #1e293b;
        color: #94a3b8;
      }
      .actions {
        display: flex;
        gap: 0.5rem;
      }
      .btn-sm {
        padding: 0.35rem 0.75rem;
        border-radius: 5px;
        font-size: 0.8rem;
        cursor: pointer;
        border: none;
        text-decoration: none;
        display: inline-block;
      }
      .btn-edit {
        background: #334155;
        color: #e2e8f0;
        &:hover {
          background: #475569;
        }
      }
      .btn-delete {
        background: #7f1d1d;
        color: #fca5a5;
        &:hover {
          background: #991b1b;
        }
      }
      .btn {
        display: inline-block;
        padding: 0.625rem 1.25rem;
        border-radius: 8px;
        text-decoration: none;
        font-size: 0.9rem;
      }
      .btn-primary {
        background: #6366f1;
        color: white;
        &:hover {
          background: #4f46e5;
        }
      }
    `,
  ],
})
export class ArticleListComponent implements OnInit {
  private readonly articleApi = inject(ArticleApiService);

  public readonly articles = signal<Article[]>([]);
  public readonly loading = signal(true);

  public ngOnInit(): void {
    this.articleApi.getAll().subscribe({
      next: articles => {
        this.articles.set(articles);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  public delete(article: Article): void {
    if (!confirm(`Delete "${article.title}"?`)) return;
    this.articleApi.delete(article.id).subscribe(() => {
      this.articles.update(list => list.filter(a => a.id !== article.id));
    });
  }
}
