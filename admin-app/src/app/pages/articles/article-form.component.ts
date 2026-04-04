import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { Article, ArticleCategory } from '@ivanrogulj.com/shared/data-access/model';
import { ArticleApiService } from '../../services/article-api.service';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [FormsModule, RouterLink, QuillModule],
  template: `
    <div class="page">
      <header class="header">
        <div class="header-left">
          <a routerLink="/articles" class="back-link">← Articles</a>
          <h1>{{ isEdit() ? 'Edit Article' : 'New Article' }}</h1>
        </div>
        <button class="btn btn-primary" (click)="save()" [disabled]="saving()">
          @if (saving()) { Saving... } @else { Save Article }
        </button>
      </header>
      <main class="content">
        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
        <div class="form-grid">
          <div class="field">
            <label>Title</label>
            <input
              type="text"
              [(ngModel)]="title"
              name="title"
              placeholder="Article title..."
            />
          </div>
          <div class="field">
            <label>Category</label>
            <select [(ngModel)]="category" name="category">
              <option value="DEVELOPMENT">Development</option>
              <option value="MUSIC">Music</option>
              <option value="AUDIO_ENGINEERING">Audio Engineering</option>
            </select>
          </div>
          <div class="field field-full">
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="published"
                name="published"
              />
              Published
            </label>
          </div>
          <div class="field field-full">
            <label>Content</label>
            <quill-editor
              [(ngModel)]="content"
              name="content"
              [modules]="quillModules"
              placeholder="Write your article..."
            ></quill-editor>
          </div>
        </div>
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
        max-width: 900px;
        margin: 0 auto;
      }
      .error {
        color: #f87171;
        background: #450a0a;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .field-full {
        grid-column: 1 / -1;
      }
      label {
        color: #94a3b8;
        font-size: 0.875rem;
      }
      input[type='text'],
      select {
        padding: 0.75rem;
        background: #0f3460;
        border: 1px solid #334155;
        border-radius: 8px;
        color: #e2e8f0;
        font-size: 1rem;
        &:focus {
          outline: none;
          border-color: #6366f1;
        }
      }
      select option {
        background: #0f3460;
      }
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        color: #e2e8f0;
        font-size: 0.95rem;
        input[type='checkbox'] {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
        }
      }
      quill-editor {
        display: block;
        border-radius: 8px;
        overflow: hidden;
      }
      :host ::ng-deep .ql-toolbar {
        background: #0f3460;
        border-color: #334155;
      }
      :host ::ng-deep .ql-toolbar .ql-stroke {
        stroke: #94a3b8;
      }
      :host ::ng-deep .ql-toolbar .ql-fill {
        fill: #94a3b8;
      }
      :host ::ng-deep .ql-toolbar button:hover .ql-stroke {
        stroke: #e2e8f0;
      }
      :host ::ng-deep .ql-toolbar button:hover .ql-fill {
        fill: #e2e8f0;
      }
      :host ::ng-deep .ql-container {
        background: #16213e;
        border-color: #334155;
        min-height: 300px;
      }
      :host ::ng-deep .ql-editor {
        color: #e2e8f0;
        font-size: 1rem;
        min-height: 300px;
      }
      :host ::ng-deep .ql-editor.ql-blank::before {
        color: #475569;
      }
      .btn {
        padding: 0.625rem 1.25rem;
        border-radius: 8px;
        font-size: 0.9rem;
        cursor: pointer;
        border: none;
      }
      .btn-primary {
        background: #6366f1;
        color: white;
        &:hover:not(:disabled) {
          background: #4f46e5;
        }
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    `,
  ],
})
export class ArticleFormComponent implements OnInit {
  private readonly articleApi = inject(ArticleApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public readonly isEdit = signal(false);
  public readonly saving = signal(false);
  public readonly error = signal<string | null>(null);

  private editId: string | null = null;

  public title = '';
  public content = '';
  public category: ArticleCategory = ArticleCategory.DEVELOPMENT;
  public published = false;

  public readonly quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean'],
    ],
  };

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.editId = id;
      this.articleApi.getAll().subscribe(articles => {
        const article = articles.find((a: Article) => a.id === id);
        if (article) {
          this.title = article.title;
          this.content = article.content;
          this.category = article.category;
          this.published = article.published;
        }
      });
    }
  }

  public save(): void {
    if (!this.title.trim()) {
      this.error.set('Title is required');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const payload = {
      title: this.title,
      content: this.content,
      category: this.category,
      published: this.published,
    };
    const request$ =
      this.isEdit() && this.editId
        ? this.articleApi.update(this.editId, payload)
        : this.articleApi.create(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/articles']),
      error: err => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Failed to save article');
      },
    });
  }
}
