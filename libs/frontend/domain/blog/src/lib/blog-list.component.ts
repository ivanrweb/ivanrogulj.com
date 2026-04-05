import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { Article, ArticleCategory } from '@ivanrogulj.com/shared/data-access/model';
import { ArticleApiService } from '@ivanrogulj.com/frontend/shared/data-access/api';

interface BlogListState {
  articles: Article[];
  loading: boolean;
  selectedCategory: ArticleCategory | null;
}

@Component({
  selector: 'lib-blog-list',
  standalone: true,
  imports: [RouterLink],
  providers: [ComponentStore],
  template: `
    <div class="blog-page">
      <div class="blog-header">
        <h1>The Blog</h1>
        <p>Web Audio, JUCE, Angular, NestJS and more.</p>
      </div>

      <div class="filter-tabs">
        <button
          class="tab"
          [class.active]="selectedCategory() === null"
          (click)="setCategory(null)"
        >All</button>
        <button
          class="tab"
          [class.active]="selectedCategory() === 'DEVELOPMENT'"
          (click)="setCategory(ArticleCategory.DEVELOPMENT)"
        >Development</button>
        <button
          class="tab"
          [class.active]="selectedCategory() === 'MUSIC'"
          (click)="setCategory(ArticleCategory.MUSIC)"
        >Music</button>
        <button
          class="tab"
          [class.active]="selectedCategory() === 'AUDIO_ENGINEERING'"
          (click)="setCategory(ArticleCategory.AUDIO_ENGINEERING)"
        >Audio Engineering</button>
      </div>

      @if (loading()) {
        <div class="loading">Loading articles...</div>
      } @else if (filteredArticles().length === 0) {
        <div class="empty">No articles yet.</div>
      } @else {
        <div class="articles-grid">
          @for (article of filteredArticles(); track article.id) {
            <article class="article-card" [routerLink]="['/articles', article.slug]">
              <div class="card-meta">
                <span class="category-badge">{{ categoryLabel(article.category) }}</span>
                <span class="date">{{ article.createdAt.slice(0, 10) }}</span>
              </div>
              <h2>{{ article.title }}</h2>
              <p class="excerpt">{{ excerpt(article.content) }}</p>
              <span class="read-more">Read more →</span>
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

    :host { display: block; background: #0b0c10; min-height: 100vh; }

    .blog-header {
      text-align: center;
      padding: 4rem 2rem 2rem;
      border-bottom: 1px solid rgba(69,162,158,0.2);
      h1 {
        font-family: 'Fira Code', monospace;
        font-size: 2rem;
        color: #66fcf1;
        margin: 0 0 0.5rem;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      p { color: #888; font-family: 'Inter', sans-serif; font-size: 1rem; }
    }

    .filter-tabs {
      display: flex;
      gap: 0.75rem;
      padding: 1.5rem 2rem;
      max-width: 1000px;
      margin: 0 auto;
      flex-wrap: wrap;
    }

    .tab {
      padding: 0.4rem 1rem;
      border: 1px solid #333;
      border-radius: 20px;
      background: transparent;
      color: #888;
      font-family: 'Fira Code', monospace;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
      &:hover { border-color: #66fcf1; color: #66fcf1; }
      &.active { background: rgba(102,252,241,0.1); border-color: #66fcf1; color: #66fcf1; }
    }

    .loading, .empty {
      text-align: center;
      color: #555;
      padding: 4rem;
      font-family: 'Fira Code', monospace;
    }

    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 2rem 4rem;
    }

    .article-card {
      background: #1f2833;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 1.75rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      text-decoration: none;
      color: inherit;
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        border-color: #ff007f;
      }
    }

    .card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .category-badge {
      font-family: 'Fira Code', monospace;
      font-size: 0.7rem;
      color: #ff007f;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .date { font-size: 0.75rem; color: #555; }

    h2 {
      font-family: 'Fira Code', monospace;
      font-size: 1.1rem;
      color: #66fcf1;
      margin: 0;
      line-height: 1.4;
    }

    .excerpt {
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      color: #888;
      line-height: 1.6;
      flex-grow: 1;
    }

    .read-more {
      font-family: 'Fira Code', monospace;
      font-size: 0.8rem;
      color: #45a29e;
      margin-top: auto;
    }
  `],
})
export class BlogListComponent implements OnInit {
  private readonly store = new ComponentStore<BlogListState>({
    articles: [],
    loading: true,
    selectedCategory: null,
  });
  private readonly articleApi = inject(ArticleApiService);

  public readonly ArticleCategory = ArticleCategory;
  public readonly loading = this.store.selectSignal((s) => s.loading);
  public readonly selectedCategory = this.store.selectSignal((s) => s.selectedCategory);
  public readonly filteredArticles = this.store.selectSignal((s) => {
    if (!s.selectedCategory) return s.articles.filter((a) => a.published);
    return s.articles.filter((a) => a.published && a.category === s.selectedCategory);
  });

  public ngOnInit(): void {
    this.articleApi.getAll().subscribe({
      next: (articles) => this.store.patchState({ articles, loading: false }),
      error: () => this.store.patchState({ loading: false }),
    });
  }

  public setCategory(category: ArticleCategory | null): void {
    this.store.patchState({ selectedCategory: category });
  }

  public excerpt(html: string): string {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 150 ? text.slice(0, 150) + '...' : text;
  }

  public categoryLabel(category: ArticleCategory): string {
    const labels: Record<ArticleCategory, string> = {
      [ArticleCategory.DEVELOPMENT]: 'Development',
      [ArticleCategory.MUSIC]: 'Music',
      [ArticleCategory.AUDIO_ENGINEERING]: 'Audio Engineering',
    };
    return labels[category];
  }
}
