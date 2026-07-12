import { Component, computed, inject, output, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JaminiApi } from '@ivanrogulj.com/shared/data-access/model';
import { JaminiApiService } from '../../service/jamini-api.service';
import { JaminiViewModel } from '../../viewmodel/jamini.viewmodel';

const YOUTUBE_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
  /(?:youtu\.be\/)([\w-]{11})/,
  /(?:youtube\.com\/embed\/)([\w-]{11})/,
  /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  /(?:youtube\.com\/live\/)([\w-]{11})/,
];

@Component({
  selector: 'lib-create-jam-dialog',
  standalone: true,
  imports: [AsyncPipe, FormsModule],
  template: `
    <div class="overlay" (click)="closed.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>New Jam</h3>
          <button class="close-btn" type="button" (click)="closed.emit()">✕</button>
        </div>

        <p class="hint">Paste a YouTube link of the video you want to practice.</p>

        <input
          class="url-input"
          type="text"
          placeholder="https://www.youtube.com/watch?v=..."
          [ngModel]="url()"
          (ngModelChange)="onUrlChange($event)"
          autocomplete="off"
        />

        @if (videoId(); as id) {
          <div class="preview">
            <img class="thumb" [src]="'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'" alt="Video preview" />
            <input
              class="name-input"
              type="text"
              placeholder="Name (optional)"
              [ngModel]="name()"
              (ngModelChange)="name.set($event)"
              autocomplete="off"
            />
          </div>

          <div class="categories">
            <span class="categories-label">Categories</span>
            <div class="chips">
              @for (category of vm.categories$ | async; track category.id) {
                <button
                  class="chip"
                  type="button"
                  [class.selected]="selectedCategoryIds().includes(category.id)"
                  (click)="toggleCategory(category.id)"
                >
                  {{ category.name }}
                </button>
              }
              @if (isAddingCategory()) {
                <input
                  class="new-category-input"
                  type="text"
                  placeholder="Category name"
                  [ngModel]="newCategoryName()"
                  (ngModelChange)="newCategoryName.set($event)"
                  (keydown.enter)="createCategory()"
                  (keydown.escape)="isAddingCategory.set(false)"
                  autocomplete="off"
                />
                <button class="chip confirm" type="button" (click)="createCategory()">add</button>
              } @else {
                <button class="chip new" type="button" (click)="isAddingCategory.set(true)">+ new category</button>
              }
            </div>
          </div>
        } @else if (url().trim().length > 0) {
          <p class="error">That doesn't look like a YouTube link.</p>
        }

        @if (saveError()) {
          <p class="error">{{ saveError() }}</p>
        }

        <div class="actions">
          <button class="btn" type="button" (click)="closed.emit()">Cancel</button>
          <button class="btn primary" type="button" [disabled]="!videoId() || isSaving()" (click)="save()">
            {{ isSaving() ? 'Saving…' : 'Save Jam' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .dialog {
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 1.5rem;
        width: min(480px, calc(100vw - 2rem));
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .dialog-header h3 {
        font-family: 'Fira Code', monospace;
        color: #66fcf1;
        margin: 0;
        font-size: 1.1rem;
      }

      .close-btn {
        background: none;
        border: none;
        color: #888;
        font-size: 1rem;
        cursor: pointer;
      }

      .close-btn:hover {
        color: #c5c6c7;
      }

      .hint {
        font-family: 'Inter', sans-serif;
        color: #888;
        font-size: 0.85rem;
        margin: 0;
      }

      .url-input,
      .name-input,
      .new-category-input {
        background: #0b0c10;
        border: 1px solid #333;
        border-radius: 4px;
        color: #c5c6c7;
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
        padding: 0.6rem 0.75rem;
        outline: none;
        width: 100%;
        box-sizing: border-box;
      }

      .url-input:focus,
      .name-input:focus,
      .new-category-input:focus {
        border-color: #66fcf1;
      }

      @media (max-width: 640px) {
        .url-input,
        .name-input,
        .new-category-input {
          font-size: 16px;
        }
      }

      .preview {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .thumb {
        width: 100%;
        border-radius: 4px;
        border: 1px solid #333;
        aspect-ratio: 16 / 9;
        object-fit: cover;
      }

      .categories {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .categories-label {
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        color: #888;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }

      .chip {
        font-family: 'Fira Code', monospace;
        font-size: 0.78rem;
        color: #c5c6c7;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid #333;
        border-radius: 20px;
        padding: 4px 12px;
        cursor: pointer;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }

      .chip:hover {
        border-color: #45a29e;
      }

      .chip.selected {
        color: #66fcf1;
        border-color: #66fcf1;
        background: rgba(102, 252, 241, 0.08);
      }

      .chip.new,
      .chip.confirm {
        color: #45a29e;
        border-style: dashed;
      }

      .new-category-input {
        width: 150px;
      }

      .error {
        font-family: 'Fira Code', monospace;
        color: #ff007f;
        font-size: 0.8rem;
        margin: 0;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
      }

      .btn {
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
        color: #c5c6c7;
        background: none;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 0.5rem 1.1rem;
        cursor: pointer;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }

      .btn:hover {
        border-color: #888;
      }

      .btn.primary {
        color: #66fcf1;
        border-color: rgba(102, 252, 241, 0.4);
        background: rgba(102, 252, 241, 0.08);
      }

      .btn.primary:hover:not(:disabled) {
        border-color: #66fcf1;
        background: rgba(102, 252, 241, 0.18);
      }

      .btn.primary:disabled {
        opacity: 0.4;
        cursor: default;
      }
    `,
  ],
})
export class CreateJamDialogComponent {
  public readonly closed = output<void>();
  public readonly created = output<JaminiApi.JamListItem>();

  public readonly vm = inject(JaminiViewModel);
  private readonly apiService = inject(JaminiApiService);

  public readonly url = signal('');
  public readonly name = signal('');
  public readonly selectedCategoryIds = signal<string[]>([]);
  public readonly isAddingCategory = signal(false);
  public readonly newCategoryName = signal('');
  public readonly isSaving = signal(false);
  public readonly saveError = signal<string | null>(null);

  public readonly videoId = computed(() => {
    const url = this.url().trim();
    for (const pattern of YOUTUBE_ID_PATTERNS) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  });

  public onUrlChange(url: string): void {
    this.url.set(url);
    this.saveError.set(null);
  }

  public toggleCategory(categoryId: string): void {
    this.selectedCategoryIds.update((ids) =>
      ids.includes(categoryId) ? ids.filter((id) => id !== categoryId) : [...ids, categoryId],
    );
  }

  public createCategory(): void {
    const name = this.newCategoryName().trim();
    if (!name) return;
    this.apiService.createCategory(name).subscribe({
      next: (category) => {
        this.vm.loadCategories();
        this.selectedCategoryIds.update((ids) => [...ids, category.id]);
        this.newCategoryName.set('');
        this.isAddingCategory.set(false);
      },
      error: () => this.saveError.set('Could not create the category.'),
    });
  }

  public save(): void {
    if (!this.videoId() || this.isSaving()) return;
    this.isSaving.set(true);
    this.saveError.set(null);
    this.apiService
      .createJam({
        youtubeUrl: this.url().trim(),
        name: this.name().trim() || undefined,
        categoryIds: this.selectedCategoryIds(),
      })
      .subscribe({
        next: (jam) => {
          this.isSaving.set(false);
          this.created.emit(jam);
        },
        error: () => {
          this.isSaving.set(false);
          this.saveError.set('Could not save the Jam. Are you logged in?');
        },
      });
  }
}
