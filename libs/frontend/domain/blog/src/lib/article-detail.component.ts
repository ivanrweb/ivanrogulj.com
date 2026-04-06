import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Article } from '@ivanrogulj.com/shared/data-access/model';
import { ArticleApiService } from '@ivanrogulj.com/frontend/shared/data-access/api';

@Component({
  selector: 'lib-article-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="article-page">
      <div class="article-nav">
        <a routerLink="/articles" class="back-link">← Back to Articles</a>
      </div>
      @if (loading()) {
        <div class="loading">Loading...</div>
      } @else if (!article()) {
        <div class="not-found">Article not found.</div>
      } @else {
        <article class="article-content">
          <div class="article-meta">
            <span class="category">{{ article()!.category }}</span>
            <span class="date">{{ article()!.createdAt.slice(0, 10) }}</span>
          </div>
          <h1>{{ article()!.title }}</h1>
          <div class="body" [innerHTML]="article()!.content"></div>
        </article>
      }
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

    :host { display: block; background: #0b0c10; min-height: 100vh; }

    .article-nav {
      padding: 1.5rem 2rem;
    }

    .back-link {
      font-family: 'Fira Code', monospace;
      font-size: 0.85rem;
      color: #45a29e;
      text-decoration: none;
      &:hover { color: #66fcf1; }
    }

    .loading, .not-found {
      text-align: center;
      padding: 4rem;
      color: #555;
      font-family: 'Fira Code', monospace;
    }

    .article-content {
      padding: 0 2rem 6rem;
    }

    .article-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .category {
      font-family: 'Fira Code', monospace;
      font-size: 0.75rem;
      color: #ff007f;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .date { font-size: 0.8rem; color: #555; }

    h1 {
      font-family: 'Fira Code', monospace;
      font-size: 2rem;
      color: #66fcf1;
      margin: 0 0 2rem;
      line-height: 1.3;
      border-bottom: 1px solid rgba(69,162,158,0.2);
      padding-bottom: 1.5rem;
    }

    .body {
      font-family: 'Inter', sans-serif;
      font-size: 1.05rem;
      line-height: 1.8;
      color: #c5c6c7;

      h1, h2, h3 {
        font-family: 'Fira Code', monospace;
        color: #66fcf1;
        margin: 2rem 0 1rem;
      }
      h1 { font-size: 1.6rem; }
      h2 { font-size: 1.3rem; }
      h3 { font-size: 1.1rem; }
      p { margin-bottom: 1.25rem; }
      strong { color: #e2e8f0; }
      em { color: #94a3b8; }
      a { color: #45a29e; &:hover { color: #66fcf1; } }
      blockquote {
        border-left: 3px solid #45a29e;
        padding-left: 1rem;
        color: #888;
        font-style: italic;
        margin: 1.5rem 0;
      }
      pre, code {
        font-family: 'Fira Code', monospace;
        background: #1f2833;
        border-radius: 4px;
        padding: 0.2rem 0.4rem;
        font-size: 0.9rem;
        color: #66fcf1;
      }
      pre { padding: 1rem; overflow-x: auto; }
      ul, ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
      li { margin-bottom: 0.4rem; }
      white-space: pre-wrap;
      overflow-wrap: break-word;
      word-break: break-word;
    }
  `],
})
export class ArticleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly articleApi = inject(ArticleApiService);

  public readonly article = signal<Article | null>(null);
  public readonly loading = signal(true);

  public ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.articleApi.getBySlug(slug).subscribe({
      next: (article) => {
        this.article.set(article);
        this.loading.set(false);
      },
      error: () => {
        this.article.set(null);
        this.loading.set(false);
      },
    });
  }
}
