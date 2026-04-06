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
        max-width: 1100px;
        margin: 0 auto;
      }
      .error {
        font-family: 'Fira Code', monospace;
        color: #f87171;
        background: rgba(248, 113, 113, 0.08);
        border: 1px solid rgba(248, 113, 113, 0.3);
        padding: 0.75rem 1rem;
        border-radius: 4px;
        margin-bottom: 1.5rem;
        font-size: 0.875rem;
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
        font-family: 'Fira Code', monospace;
        color: #888;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      input[type='text'],
      select {
        padding: 0.75rem;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 4px;
        color: #c5c6c7;
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        transition: border-color 0.2s;
        &:focus {
          outline: none;
          border-color: #45a29e;
        }
      }
      select option {
        background: #1f2833;
      }
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        color: #888;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        input[type='checkbox'] {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
          accent-color: #66fcf1;
        }
      }
      quill-editor {
        display: block;
        border-radius: 4px;
        overflow: hidden;
      }
      :host ::ng-deep .ql-toolbar {
        background: #1f2833;
        border-color: #333;
      }
      :host ::ng-deep .ql-toolbar .ql-stroke {
        stroke: #888;
      }
      :host ::ng-deep .ql-toolbar .ql-fill {
        fill: #888;
      }
      :host ::ng-deep .ql-toolbar button:hover .ql-stroke,
      :host ::ng-deep .ql-toolbar .ql-active .ql-stroke {
        stroke: #66fcf1;
      }
      :host ::ng-deep .ql-toolbar button:hover .ql-fill,
      :host ::ng-deep .ql-toolbar .ql-active .ql-fill {
        fill: #66fcf1;
      }
      :host ::ng-deep .ql-toolbar .ql-picker-label {
        color: #888;
        &:hover { color: #66fcf1; }
      }
      :host ::ng-deep .ql-toolbar .ql-picker-options {
        background: #1f2833;
        border-color: #333;
        color: #c5c6c7;
      }
      :host ::ng-deep .ql-container {
        background: #0b0c10;
        border-color: #333;
        min-height: 300px;
        font-family: 'Inter', sans-serif;
      }
      :host ::ng-deep .ql-editor {
        color: #c5c6c7;
        font-size: 1rem;
        min-height: 300px;
        line-height: 1.7;
      }
      :host ::ng-deep .ql-editor.ql-blank::before {
        color: #555;
      }
      :host ::ng-deep .ql-editor h1,
      :host ::ng-deep .ql-editor h2,
      :host ::ng-deep .ql-editor h3 {
        color: #66fcf1;
        font-family: 'Fira Code', monospace;
      }
      :host ::ng-deep .ql-editor a { color: #45a29e; }
      :host ::ng-deep .ql-editor blockquote {
        border-left: 3px solid #45a29e;
        color: #888;
      }
      :host ::ng-deep .ql-editor pre {
        background: #1f2833;
        color: #66fcf1;
        border-radius: 4px;
      }
      .btn {
        padding: 0.625rem 1.25rem;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: all 0.2s;
        border: 1px solid;
      }
      .btn-primary {
        background: rgba(255, 0, 127, 0.1);
        color: #ff007f;
        border-color: #ff007f;
        &:hover:not(:disabled) {
          background: rgba(255, 0, 127, 0.2);
        }
        &:disabled {
          opacity: 0.5;
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
