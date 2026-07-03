import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { AsyncPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AuthService } from '@ivanrogulj.com/auth';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AuthTooltipComponent } from '@ivanrogulj.com/auth-tooltip';
import { JaminiApi } from '@ivanrogulj.com/shared/data-access/model';
import { JaminiApiService } from '../service/jamini-api.service';
import { JaminiViewModel } from '../viewmodel/jamini.viewmodel';
import { CreateJamDialogComponent } from './create-jam-dialog/create-jam-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'lib-jamini-library',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    AuthTooltipComponent,
    CreateJamDialogComponent,
    ConfirmDialogComponent,
  ],
  host: { '(document:click)': 'onDocumentClick()' },
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Jamini</h1>
          <p class="page-subtitle">
            Save YouTube videos as Jams, mark the tough Licks, and loop them
            at your own pace.
          </p>
        </div>
        @if (authService.currentUser()) {
        <button
          class="new-jam-btn"
          type="button"
          (click)="isDialogOpen.set(true)"
        >
          + New Jam
        </button>
        } @else {
        <lib-auth-tooltip>
          <button class="new-jam-btn disabled" type="button">+ New Jam</button>
        </lib-auth-tooltip>
        }
      </header>

      @if (vm.vm$ | async; as state) { @if (authService.currentUser()) {
      <div class="filters">
        <button
          class="filter-chip"
          type="button"
          [class.active]="state.activeCategoryId === null"
          (click)="vm.setActiveCategory(null)"
        >
          All
        </button>
        @for (category of state.categories; track category.id) {
        <div
          class="filter-chip"
          [class.active]="state.activeCategoryId === category.id"
        >
          <button
            class="filter-name"
            type="button"
            (click)="vm.setActiveCategory(category.id)"
          >
            {{ category.name }}
          </button>
          <button
            class="filter-del"
            type="button"
            title="Delete category"
            (click)="askDeleteCategory($event, category)"
          >
            ✕
          </button>
        </div>
        }
      </div>

      @if (state.libraryError) {
      <p class="status error">{{ state.libraryError }}</p>
      } @else if (state.isLoadingLibrary) {
      <p class="status">Loading your Jams…</p>
      } @else if ((vm.filteredJams$ | async)?.length === 0) {
      <p class="status">
        @if (state.jams.length === 0) { No Jams yet — paste your first YouTube
        link to get started. } @else { No Jams in this category. }
      </p>
      }

      <div class="jam-grid">
        @for (jam of vm.filteredJams$ | async; track jam.id) {
        <div
          class="jam-card"
          [class.popover-open]="assignPopoverJamId() === jam.id"
          (click)="openJam(jam)"
        >
          <img
            class="jam-thumb"
            [src]="
              'https://i.ytimg.com/vi/' + jam.youtubeVideoId + '/hqdefault.jpg'
            "
            [alt]="jam.name"
          />
          <div class="jam-info">
            <span class="jam-name">{{ jam.name }}</span>
            <span class="jam-date">{{
              jam.createdAt | date : 'mediumDate'
            }}</span>
            @if (jam.categoryIds.length > 0) {
            <div class="jam-categories">
              @for (category of categoriesOf(jam, state.categories); track
              category.id) {
              <span class="jam-category-tag">{{ category.name }}</span>
              }
            </div>
            }
          </div>
          <button
            class="jam-assign"
            type="button"
            title="Assign categories"
            (click)="toggleAssignPopover($event, jam)"
          >
            #
          </button>
          <button
            class="jam-delete"
            type="button"
            title="Delete Jam"
            (click)="deleteJam($event, jam)"
          >
            ✕
          </button>
          @if (assignPopoverJamId() === jam.id) {
          <div class="assign-popover" (click)="$event.stopPropagation()">
            <span class="assign-title">Categories</span>
            <div class="assign-chips">
              @for (category of state.categories; track category.id) {
              <button
                class="assign-chip"
                type="button"
                [class.selected]="jam.categoryIds.includes(category.id)"
                (click)="toggleJamCategory(jam, category.id)"
              >
                {{ category.name }}
              </button>
              } @if (isAddingCategory()) {
              <input
                class="new-category-input"
                type="text"
                placeholder="Category name"
                [value]="newCategoryName()"
                (input)="newCategoryName.set($any($event.target).value)"
                (keydown.enter)="createCategory(jam)"
                (keydown.escape)="isAddingCategory.set(false)"
                autocomplete="off"
              />
              <button
                class="assign-chip new"
                type="button"
                (click)="createCategory(jam)"
              >
                add
              </button>
              } @else {
              <button
                class="assign-chip new"
                type="button"
                (click)="isAddingCategory.set(true)"
              >
                + new category
              </button>
              }
            </div>
          </div>
          }
        </div>
        }
      </div>
      } @else {
      <p class="status">Log in to build your practice library.</p>
      } } @if (isDialogOpen()) {
      <lib-create-jam-dialog
        (closed)="isDialogOpen.set(false)"
        (created)="onJamCreated()"
      ></lib-create-jam-dialog>
      } @if (jamPendingDelete(); as jam) {
      <lib-confirm-dialog
        title="Delete Jam"
        [message]="
          'Delete “' +
          jam.name +
          '” and all of its Licks? This cannot be undone.'
        "
        (confirmed)="confirmDeleteJam(jam)"
        (cancelled)="jamPendingDelete.set(null)"
      ></lib-confirm-dialog>
      } @if (categoryPendingDelete(); as category) {
      <lib-confirm-dialog
        title="Delete Category"
        [message]="
          'Delete the category “' +
          category.name +
          '”? It will be removed from all Jams — the Jams themselves stay.'
        "
        (confirmed)="confirmDeleteCategory(category)"
        (cancelled)="categoryPendingDelete.set(null)"
      ></lib-confirm-dialog>
      }
    </div>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

      :host {
        display: block;
        background-color: #0b0c10;
        min-height: 100%;
      }

      .page {
        max-width: 1100px;
        margin: 0 auto;
        padding: 2rem;
      }

      .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .page-title {
        font-family: 'Fira Code', monospace;
        color: #66fcf1;
        font-size: 1.6rem;
        margin: 0 0 0.4rem;
      }

      .page-subtitle {
        font-family: 'Inter', sans-serif;
        color: #888;
        font-size: 0.95rem;
        margin: 0;
        max-width: 800px;
      }

      .new-jam-btn {
        font-family: 'Fira Code', monospace;
        font-size: 0.9rem;
        color: #66fcf1;
        background: rgba(102, 252, 241, 0.08);
        border: 1px solid rgba(102, 252, 241, 0.4);
        border-radius: 4px;
        padding: 0.55rem 1.2rem;
        cursor: pointer;
        white-space: nowrap;
        transition: background 0.2s, border-color 0.2s;
      }

      .new-jam-btn:hover {
        background: rgba(102, 252, 241, 0.18);
        border-color: #66fcf1;
      }

      .new-jam-btn.disabled {
        opacity: 0.5;
        cursor: default;
      }

      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 1.5rem;
      }

      .filter-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-family: 'Fira Code', monospace;
        font-size: 0.78rem;
        color: #c5c6c7;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid #333;
        border-radius: 20px;
        padding: 4px 12px;
        cursor: pointer;
        outline: none;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }

      .filter-chip:hover {
        border-color: #45a29e;
      }

      .filter-chip.active {
        color: #66fcf1;
        border-color: #66fcf1;
        background: rgba(102, 252, 241, 0.08);
      }

      .filter-name {
        background: none;
        border: none;
        color: inherit;
        font: inherit;
        padding: 0;
        cursor: pointer;
        outline: none;
      }

      .filter-del {
        background: none;
        border: none;
        color: #888;
        font-size: 0.68rem;
        line-height: 1;
        padding: 0 0 0 1px;
        cursor: pointer;
        outline: none;
        transition: color 0.15s;
      }

      .filter-del:hover {
        color: #ff007f;
      }

      .status {
        font-family: 'Fira Code', monospace;
        color: #888;
        font-size: 0.9rem;
      }

      .status.error {
        color: #ff007f;
      }

      .jam-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1.25rem;
      }

      .jam-card {
        position: relative;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .jam-card:hover {
        border-color: #66fcf1;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
      }

      /* overflow:hidden would clip the absolute-positioned assign popover */
      .jam-card.popover-open {
        overflow: visible;
      }

      .jam-thumb {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        display: block;
        background: #000;
      }

      .jam-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 0.8rem 1rem;
      }

      .jam-name {
        font-family: 'Inter', sans-serif;
        font-weight: 400;
        color: #c5c6c7;
        font-size: 0.95rem;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .jam-date {
        font-family: 'Fira Code', monospace;
        color: #888;
        font-size: 0.72rem;
      }

      .jam-categories {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 2px;
      }

      .jam-category-tag {
        font-family: 'Fira Code', monospace;
        font-size: 0.68rem;
        color: #45a29e;
        border: 1px solid rgba(69, 162, 158, 0.4);
        border-radius: 3px;
        padding: 1px 6px;
        white-space: nowrap;
      }

      .jam-delete,
      .jam-assign {
        position: absolute;
        top: 8px;
        background: rgba(11, 12, 16, 0.75);
        border: 1px solid;
        border-radius: 4px;
        font-size: 0.75rem;
        padding: 3px 7px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s, border-color 0.15s, background 0.15s;
      }

      .jam-delete {
        right: 8px;
        color: #ff007f;
        border-color: rgba(255, 0, 127, 0.4);
      }

      .jam-assign {
        right: 40px;
        font-family: 'Fira Code', monospace;
        color: #45a29e;
        border-color: rgba(69, 162, 158, 0.4);
      }

      .jam-card:hover .jam-delete,
      .jam-card:hover .jam-assign {
        opacity: 1;
      }

      .jam-delete:hover {
        border-color: #ff007f;
        background: rgba(255, 0, 127, 0.15);
      }

      .jam-assign:hover {
        border-color: #45a29e;
        background: rgba(69, 162, 158, 0.15);
      }

      .assign-popover {
        position: absolute;
        top: 38px;
        right: 8px;
        z-index: 10;
        background: #0b0c10;
        border: 1px solid #45a29e;
        border-radius: 6px;
        padding: 0.75rem;
        width: min(260px, calc(100% - 16px));
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        cursor: default;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
      }

      .assign-title {
        font-family: 'Fira Code', monospace;
        font-size: 0.72rem;
        color: #888;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .assign-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }

      .assign-chip {
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        color: #c5c6c7;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid #333;
        border-radius: 20px;
        padding: 3px 10px;
        cursor: pointer;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }

      .assign-chip:hover {
        border-color: #45a29e;
      }

      .assign-chip.selected {
        color: #66fcf1;
        border-color: #66fcf1;
        background: rgba(102, 252, 241, 0.08);
      }

      .assign-chip.new {
        color: #45a29e;
        border-style: dashed;
      }

      .new-category-input {
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 4px;
        color: #c5c6c7;
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        padding: 4px 8px;
        outline: none;
        width: 130px;
      }

      .new-category-input:focus {
        border-color: #66fcf1;
      }

      @media (max-width: 640px) {
        .page-header {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class JaminiLibraryComponent implements OnInit {
  public readonly vm = inject(JaminiViewModel);
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiService = inject(JaminiApiService);

  public readonly isDialogOpen = signal(false);
  public readonly assignPopoverJamId = signal<string | null>(null);
  public readonly isAddingCategory = signal(false);
  public readonly newCategoryName = signal('');
  public readonly jamPendingDelete = signal<JaminiApi.JamListItem | null>(
    null
  );
  public readonly categoryPendingDelete = signal<JaminiApi.Category | null>(
    null
  );

  public ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && this.authService.currentUser()) {
      this.vm.loadLibrary();
      this.vm.loadCategories();
    }
  }

  public onDocumentClick(): void {
    this.assignPopoverJamId.set(null);
    this.isAddingCategory.set(false);
  }

  public openJam(jam: JaminiApi.JamListItem): void {
    // While the assign popover is open, a stray card click should close it, not navigate
    if (this.assignPopoverJamId() !== null) {
      this.onDocumentClick();
      return;
    }
    this.router.navigate(['/audio/jamini', jam.id]);
  }

  public deleteJam(event: Event, jam: JaminiApi.JamListItem): void {
    event.stopPropagation();
    this.jamPendingDelete.set(jam);
  }

  public askDeleteCategory(event: Event, category: JaminiApi.Category): void {
    event.stopPropagation();
    this.categoryPendingDelete.set(category);
  }

  public confirmDeleteCategory(category: JaminiApi.Category): void {
    this.categoryPendingDelete.set(null);
    this.vm.deleteCategory(category.id);
  }

  public confirmDeleteJam(jam: JaminiApi.JamListItem): void {
    this.jamPendingDelete.set(null);
    this.vm.deleteJam(jam.id);
  }

  public toggleAssignPopover(
    event: Event,
    jam: JaminiApi.JamListItem
  ): void {
    event.stopPropagation();
    this.isAddingCategory.set(false);
    this.assignPopoverJamId.update((current) =>
      current === jam.id ? null : jam.id
    );
  }

  public toggleJamCategory(
    jam: JaminiApi.JamListItem,
    categoryId: string
  ): void {
    const categoryIds = jam.categoryIds.includes(categoryId)
      ? jam.categoryIds.filter((id) => id !== categoryId)
      : [...jam.categoryIds, categoryId];
    this.vm.setJamCategories({ jamId: jam.id, categoryIds });
  }

  public createCategory(jam: JaminiApi.JamListItem): void {
    const name = this.newCategoryName().trim();
    if (!name) return;
    this.apiService.createCategory(name).subscribe((category) => {
      this.vm.loadCategories();
      this.vm.setJamCategories({
        jamId: jam.id,
        categoryIds: [...jam.categoryIds, category.id],
      });
      this.newCategoryName.set('');
      this.isAddingCategory.set(false);
    });
  }

  public categoriesOf(
    jam: JaminiApi.JamListItem,
    categories: JaminiApi.Category[]
  ): JaminiApi.Category[] {
    return categories.filter((c) => jam.categoryIds.includes(c.id));
  }

  public onJamCreated(): void {
    this.isDialogOpen.set(false);
    this.vm.loadLibrary();
  }
}
