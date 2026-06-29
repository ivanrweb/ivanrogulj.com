import { Component, inject, OnInit, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { Article } from '@ivanrogulj.com/shared/data-access/model';
import { ArticleApiService } from '@ivanrogulj.com/frontend/shared/data-access/api';
import { RouterLink } from '@angular/router';
import { MEDIUM_USERNAME } from './blog.tokens';

@Component({
  selector: 'lib-blog-list',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  template: `
    <div class="blog-page">
      <div class="blog-header">
        <h1>Articles</h1>
        <p>
          I write about Web Audio API, MIDI-to-browser connectivity, audio
          synthesis, Angular, NestJS and more — written on Medium, synched here.
        </p>
        <a
          class="medium-link"
          [href]="'https://medium.com/' + mediumUsername"
          target="_blank"
          rel="noopener"
        >
          Follow on Medium ↗
        </a>
      </div>

      @if (loading()) {
      <div class="loading">Loading articles...</div>
      } @else if (articles().length === 0) {
      <div class="empty">No articles yet — check back soon.</div>
      } @else {
      <div class="articles-grid">
        @for (article of articles(); track article.id) {
        <article
          class="article-card"
          [routerLink]="['/articles', article.slug]"
        >
          @if (article.coverImage) {
          <img
            class="card-cover"
            [src]="article.coverImage"
            [alt]="article.title"
            loading="lazy"
          />
          }
          <div class="card-body">
            <div class="card-meta">
              @if (article.tags.length > 0) {
              <span class="tag">{{ article.tags[0] }}</span>
              }
              <span class="date">{{
                article.publishedAt | slice : 0 : 10
              }}</span>
            </div>
            <h2>{{ article.title }}</h2>
            <p class="excerpt">{{ article.excerpt }}</p>
            <span class="read-more">Read more →</span>
          </div>
        </article>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

      :host {
        display: block;
        background: #0b0c10;
      }

      .blog-header {
        text-align: center;
        padding: 4rem 2rem 2rem;
        border-bottom: 1px solid rgba(69, 162, 158, 0.2);
        h1 {
          font-family: 'Fira Code', monospace;
          font-size: 2rem;
          color: #66fcf1;
          margin: 0 0 0.5rem;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        p {
          color: #888;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          margin: 0 0 1.25rem;
        }
      }

      .medium-link {
        display: inline-block;
        font-family: 'Fira Code', monospace;
        font-size: 0.8rem;
        color: #66fcf1;
        border: 1px solid rgba(102, 252, 241, 0.4);
        border-radius: 4px;
        padding: 0.4rem 1rem;
        text-decoration: none;
        transition: all 0.2s;
        &:hover {
          background: rgba(102, 252, 241, 0.08);
          border-color: #66fcf1;
        }
      }

      .loading,
      .empty {
        text-align: center;
        color: #555;
        padding: 4rem;
        font-family: 'Fira Code', monospace;
      }

      .articles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        padding: 2rem 2rem 4rem;
      }

      .article-card {
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        text-decoration: none;
        color: inherit;
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          border-color: #ff007f;
        }
      }

      .card-cover {
        width: 100%;
        height: 180px;
        object-fit: cover;
        display: block;
      }

      .card-body {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        flex: 1;
      }

      .card-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .tag {
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
        color: #ff007f;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .date {
        font-size: 0.75rem;
        color: #555;
      }

      h2 {
        font-family: 'Fira Code', monospace;
        font-size: 1.05rem;
        color: #66fcf1;
        margin: 0;
        line-height: 1.4;
      }

      .excerpt {
        font-family: 'Inter', sans-serif;
        font-size: 0.88rem;
        color: #888;
        line-height: 1.6;
        flex-grow: 1;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }

      .read-more {
        font-family: 'Fira Code', monospace;
        font-size: 0.8rem;
        color: #45a29e;
        margin-top: auto;
      }
    `,
  ],
})
export class BlogListComponent implements OnInit {
  private readonly articleApi = inject(ArticleApiService);
  protected readonly mediumUsername = inject(MEDIUM_USERNAME);
  public readonly articles = signal<Omit<Article, 'content'>[]>([]);
  public readonly loading = signal(true);

  public ngOnInit(): void {
    this.articleApi.getAll().subscribe({
      next: (articles) => {
        this.articles.set(articles);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
