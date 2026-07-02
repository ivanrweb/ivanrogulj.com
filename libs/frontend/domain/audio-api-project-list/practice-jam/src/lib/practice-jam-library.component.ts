import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { AsyncPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AuthService } from '@ivanrogulj.com/auth';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AuthTooltipComponent } from '@ivanrogulj.com/auth-tooltip';
import { PracticeJamApi } from '@ivanrogulj.com/shared/data-access/model';
import { PracticeJamViewModel } from '../viewmodel/practice-jam.viewmodel';
import { CreateJamDialogComponent } from './create-jam-dialog/create-jam-dialog.component';

@Component({
  selector: 'lib-practice-jam-library',
  standalone: true,
  imports: [AsyncPipe, DatePipe, AuthTooltipComponent, CreateJamDialogComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">PracticeJam</h1>
          <p class="page-subtitle">
            Save YouTube videos as Jams, mark the tough Phrases, and loop them at your own pace.
          </p>
        </div>
        @if (authService.currentUser()) {
          <button class="new-jam-btn" type="button" (click)="isDialogOpen.set(true)">+ New Jam</button>
        } @else {
          <lib-auth-tooltip>
            <button class="new-jam-btn disabled" type="button">+ New Jam</button>
          </lib-auth-tooltip>
        }
      </header>

      @if (vm.vm$ | async; as state) {
        @if (authService.currentUser()) {
          <div class="filters">
            <button
              class="filter-chip"
              type="button"
              [class.active]="state.activeSetlistId === null"
              (click)="vm.setActiveSetlist(null)"
            >
              All
            </button>
            @for (setlist of state.setlists; track setlist.id) {
              <button
                class="filter-chip"
                type="button"
                [class.active]="state.activeSetlistId === setlist.id"
                (click)="vm.setActiveSetlist(setlist.id)"
              >
                {{ setlist.name }}
              </button>
            }
          </div>

          @if (state.libraryError) {
            <p class="status error">{{ state.libraryError }}</p>
          } @else if (state.isLoadingLibrary) {
            <p class="status">Loading your Jams…</p>
          } @else if ((vm.filteredJams$ | async)?.length === 0) {
            <p class="status">
              @if (state.jams.length === 0) {
                No Jams yet — paste your first YouTube link to get started.
              } @else {
                No Jams in this setlist.
              }
            </p>
          }

          <div class="jam-grid">
            @for (jam of vm.filteredJams$ | async; track jam.id) {
              <div class="jam-card" (click)="openJam(jam)">
                <img
                  class="jam-thumb"
                  [src]="'https://i.ytimg.com/vi/' + jam.youtubeVideoId + '/hqdefault.jpg'"
                  [alt]="jam.name"
                />
                <div class="jam-info">
                  <span class="jam-name">{{ jam.name }}</span>
                  <span class="jam-date">{{ jam.createdAt | date : 'mediumDate' }}</span>
                </div>
                <button
                  class="jam-delete"
                  type="button"
                  title="Delete Jam"
                  (click)="deleteJam($event, jam)"
                >
                  ✕
                </button>
              </div>
            }
          </div>
        } @else {
          <p class="status">Log in to build your practice library.</p>
        }
      }

      @if (isDialogOpen()) {
        <lib-create-jam-dialog (closed)="isDialogOpen.set(false)" (created)="onJamCreated()"></lib-create-jam-dialog>
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
        max-width: 480px;
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
        font-family: 'Fira Code', monospace;
        font-size: 0.78rem;
        color: #c5c6c7;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid #333;
        border-radius: 20px;
        padding: 4px 14px;
        cursor: pointer;
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
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .jam-card:hover {
        transform: translateY(-3px);
        border-color: #66fcf1;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
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

      .jam-delete {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(11, 12, 16, 0.75);
        border: 1px solid #333;
        border-radius: 4px;
        color: #888;
        font-size: 0.75rem;
        padding: 3px 7px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s, color 0.15s, border-color 0.15s;
      }

      .jam-card:hover .jam-delete {
        opacity: 1;
      }

      .jam-delete:hover {
        color: #ff007f;
        border-color: #ff007f;
      }

      @media (max-width: 640px) {
        .page-header {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class PracticeJamLibraryComponent implements OnInit {
  public readonly vm = inject(PracticeJamViewModel);
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  public readonly isDialogOpen = signal(false);

  public ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && this.authService.currentUser()) {
      this.vm.loadLibrary();
      this.vm.loadSetlists();
    }
  }

  public openJam(jam: PracticeJamApi.JamListItem): void {
    this.router.navigate(['/audio/practice-jam', jam.id]);
  }

  public deleteJam(event: Event, jam: PracticeJamApi.JamListItem): void {
    event.stopPropagation();
    this.vm.deleteJam(jam.id);
  }

  public onJamCreated(): void {
    this.isDialogOpen.set(false);
    this.vm.loadLibrary();
  }
}
