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
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

      .page {
        min-height: 100vh;
        background: #0b0c10;
        color: #c5c6c7;
        font-family: 'Inter', sans-serif;
      }
      .header {
        background: #1f2833;
        padding: 1.25rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #333;
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }
      .back-link {
        font-family: 'Fira Code', monospace;
        color: #45a29e;
        text-decoration: none;
        font-size: 0.85rem;
        transition: color 0.2s;
        &:hover {
          color: #66fcf1;
        }
      }
      h1 {
        margin: 0;
        font-family: 'Fira Code', monospace;
        font-size: 1.25rem;
        color: #66fcf1;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      .content {
        padding: 2rem;
      }
      .loading,
      .empty {
        font-family: 'Fira Code', monospace;
        color: #555;
      }
      .empty a {
        color: #45a29e;
        &:hover { color: #66fcf1; }
      }
      .table {
        width: 100%;
        border-collapse: collapse;
        background: #1f2833;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #333;
        th {
          background: #0b0c10;
          padding: 0.875rem 1rem;
          text-align: left;
          font-family: 'Fira Code', monospace;
          color: #888;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 1px solid #333;
        }
        td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #333;
          color: #c5c6c7;
          font-size: 0.95rem;
        }
        tr:last-child td {
          border-bottom: none;
        }
        tr:hover td {
          background: rgba(102, 252, 241, 0.03);
        }
      }
      .badge {
        font-family: 'Fira Code', monospace;
        background: rgba(69, 162, 158, 0.1);
        border: 1px solid #333;
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
        font-size: 0.7rem;
        color: #45a29e;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .status {
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .published {
        background: rgba(102, 252, 241, 0.1);
        color: #66fcf1;
        border: 1px solid rgba(102, 252, 241, 0.3);
      }
      .draft {
        background: transparent;
        color: #555;
        border: 1px solid #333;
      }
      .actions {
        display: flex;
        gap: 0.5rem;
      }
      .btn-sm {
        padding: 0.3rem 0.7rem;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        cursor: pointer;
        border: 1px solid;
        text-decoration: none;
        display: inline-block;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: all 0.2s;
      }
      .btn-edit {
        background: transparent;
        border-color: #333;
        color: #888;
        &:hover {
          border-color: #45a29e;
          color: #45a29e;
        }
      }
      .btn-delete {
        background: transparent;
        border-color: rgba(248, 113, 113, 0.3);
        color: #f87171;
        &:hover {
          background: rgba(248, 113, 113, 0.1);
          border-color: #f87171;
        }
      }
      .btn {
        display: inline-block;
        padding: 0.625rem 1.25rem;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
        text-decoration: none;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: all 0.2s;
        border: 1px solid;
      }
      .btn-primary {
        background: rgba(255, 0, 127, 0.1);
        color: #ff007f;
        border-color: #ff007f;
        &:hover {
          background: rgba(255, 0, 127, 0.2);
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
