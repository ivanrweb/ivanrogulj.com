import { Component, inject, OnInit, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml, Meta, Title as TitleService } from '@angular/platform-browser';
import { Article } from '@ivanrogulj.com/shared/data-access/model';
import { ArticleApiService } from '@ivanrogulj.com/frontend/shared/data-access/api';

@Component({
  selector: 'lib-article-detail',
  standalone: true,
  imports: [RouterLink, SlicePipe],
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
          @if (article()!.coverImage) {
            <img class="hero-image" [src]="article()!.coverImage" [alt]="article()!.title" />
          }

          <div class="article-meta">
            @if (article()!.tags.length > 0) {
              <div class="tags">
                @for (tag of article()!.tags; track tag) {
                  <span class="tag">{{ tag }}</span>
                }
              </div>
            }
            <span class="date">{{ article()!.publishedAt | slice:0:10 }}</span>
          </div>

          <h1>{{ article()!.title }}</h1>

          <div class="medium-actions">
            <a class="medium-btn" [href]="article()!.mediumUrl" target="_blank" rel="noopener">
              Read on Medium ↗
            </a>
            <a class="medium-btn clap" [href]="article()!.mediumUrl" target="_blank" rel="noopener">
              👏 Clap on Medium
            </a>
          </div>

          <div class="body" [innerHTML]="safeContent()"></div>

          <div class="article-footer">
            <a class="medium-btn" [href]="article()!.mediumUrl" target="_blank" rel="noopener">
              Comment on Medium ↗
            </a>
          </div>
        </article>
      }
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

    :host { display: block; background: #0b0c10; min-height: 100vh; }

    .article-nav { padding: 1.5rem 2rem; }

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
      max-width: 760px;
      margin: 0 auto;
      padding: 0 2rem 6rem;
    }

    .hero-image {
      width: 100%;
      max-height: 420px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .article-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    .tag {
      font-family: 'Fira Code', monospace;
      font-size: 0.7rem;
      color: #ff007f;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: rgba(255,0,127,0.08);
      border: 1px solid rgba(255,0,127,0.25);
      border-radius: 3px;
      padding: 2px 8px;
    }

    .date { font-size: 0.8rem; color: #555; margin-left: auto; }

    h1 {
      font-family: 'Fira Code', monospace;
      font-size: 1.9rem;
      color: #66fcf1;
      margin: 0 0 1.5rem;
      line-height: 1.3;
      border-bottom: 1px solid rgba(69,162,158,0.2);
      padding-bottom: 1.5rem;
    }

    .medium-actions {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
    }

    .medium-btn {
      font-family: 'Fira Code', monospace;
      font-size: 0.78rem;
      color: #66fcf1;
      border: 1px solid rgba(102,252,241,0.4);
      border-radius: 4px;
      padding: 0.4rem 1rem;
      text-decoration: none;
      transition: all 0.2s;
      display: inline-block;
      &:hover { background: rgba(102,252,241,0.08); border-color: #66fcf1; }
      &.clap { color: #c5c6c7; border-color: #333; &:hover { border-color: #555; } }
    }

    .article-footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(69,162,158,0.2);
    }

    .body {
      font-family: 'Inter', sans-serif;
      font-size: 1.05rem;
      line-height: 1.8;
      color: #e2e8f0;

      ::ng-deep {
        h1, h2, h3, h4 {
          font-family: 'Fira Code', monospace;
          color: #66fcf1;
          margin: 2rem 0 1rem;
        }
        h1 { font-size: 1.6rem; }
        h2 { font-size: 1.3rem; }
        h3 { font-size: 1.1rem; }
        h4 { font-size: 1rem; }
        p { margin-bottom: 1.25rem; }
        strong { color: #fff; }
        em { color: #94a3b8; }
        a { color: #45a29e; text-decoration: underline; &:hover { color: #66fcf1; } }
        blockquote {
          border-left: 3px solid #45a29e;
          padding-left: 1.25rem;
          color: #888;
          font-style: italic;
          margin: 1.5rem 0;
        }
        pre {
          background: #1f2833;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 1rem 1.25rem;
          overflow-x: auto;
          margin-bottom: 1.25rem;
        }
        code {
          font-family: 'Fira Code', monospace;
          font-size: 0.88rem;
          color: #66fcf1;
          background: #1f2833;
          border-radius: 3px;
          padding: 0.15rem 0.4rem;
        }
        pre code { background: transparent; padding: 0; }
        ul, ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
        li { margin-bottom: 0.4rem; }
        img { max-width: 100%; border-radius: 6px; margin: 1rem 0; }
        hr { border: none; border-top: 1px solid #333; margin: 2rem 0; }
        figure { margin: 1.5rem 0; }
        figcaption { font-size: 0.85rem; color: #666; text-align: center; margin-top: 0.5rem; }
      }
    }
  `],
})
export class ArticleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly articleApi = inject(ArticleApiService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly meta = inject(Meta);
  private readonly titleService = inject(TitleService);

  public readonly article = signal<Article | null>(null);
  public readonly loading = signal(true);
  public readonly safeContent = signal<SafeHtml>('');

  public ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.articleApi.getBySlug(slug).subscribe({
      next: (article) => {
        this.article.set(article);
        this.safeContent.set(this.sanitizer.bypassSecurityTrustHtml(article.content ?? ''));
        this.titleService.setTitle(article.title);
        this.meta.updateTag({ name: 'description', content: article.excerpt });
        // Canonical URL pointing to Medium — tells Google the original is on Medium
        this.meta.updateTag({ rel: 'canonical', href: article.mediumUrl }, 'rel=canonical');
        this.loading.set(false);
      },
      error: () => {
        this.article.set(null);
        this.loading.set(false);
      },
    });
  }
}
