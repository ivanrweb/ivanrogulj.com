import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, Subscription, take } from 'rxjs';
import { JaminiApi } from '@ivanrogulj.com/shared/data-access/model';
import { JaminiState, JaminiViewModel } from '../viewmodel/jamini.viewmodel';
import { JaminiApiService } from '../service/jamini-api.service';
import { YoutubePlayerService } from '../service/youtube-player.service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

const PLAYER_ELEMENT_ID = 'jamini-player';
/** Drags shorter than this (fraction of the timeline) count as a click-to-seek. */
const CLICK_DRAG_THRESHOLD = 0.005;
/** Minimum gap between mark-in and mark-out while dragging a handle (seconds). */
const MIN_MARK_GAP = 0.1;

@Component({
  selector: 'lib-jam-player',
  standalone: true,
  imports: [AsyncPipe, ConfirmDialogComponent],
  host: {
    '(document:keydown)': 'onKeydown($event)',
    '(document:click)': 'onDocumentClick()',
  },
  template: `
    @if (vm.vm$ | async; as state) {
    <div class="page">
      <div class="player-page">
        <div class="breadcrumb">
          <button class="back-link" type="button" (click)="backToLibrary()">
            ← Library
          </button>
          @if (state.currentJam; as detail) {
          <span class="crumb-sep">/</span>
          <span class="crumb-current">{{ detail.jam.name }}</span>
          <div class="cat-control" (click)="$event.stopPropagation()">
            <button
              class="cat-btn"
              type="button"
              [class.active]="catPopoverOpen()"
              (click)="toggleCatPopover()"
            >
              #
              {{
                detail.categoryIds.length > 0
                  ? 'Categories (' + detail.categoryIds.length + ')'
                  : 'Categories'
              }}
            </button>
            @if (catPopoverOpen()) {
            <div class="cat-popover">
              <span class="cat-title">Assign categories</span>
              <div class="cat-chips">
                @for (category of vm.categories$ | async; track category.id) {
                <button
                  class="cat-chip"
                  type="button"
                  [class.selected]="detail.categoryIds.includes(category.id)"
                  (click)="toggleJamCategory(detail, category.id)"
                >
                  {{ category.name }}
                </button>
                } @if (isAddingCategory()) {
                <input
                  class="cat-new-input"
                  type="text"
                  placeholder="Category name"
                  [value]="newCategoryName()"
                  (input)="newCategoryName.set($any($event.target).value)"
                  (keydown.enter)="createCategory(detail)"
                  (keydown.escape)="isAddingCategory.set(false)"
                  autocomplete="off"
                />
                <button
                  class="cat-chip new"
                  type="button"
                  (click)="createCategory(detail)"
                >
                  add
                </button>
                } @else {
                <button
                  class="cat-chip new"
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

        @if (state.isLoadingJam) {
        <p class="status">Loading Jam…</p>
        }

        <div class="player-shell" [class.hidden]="!state.currentJam">
          <div class="player-main">
            <div class="video-frame">
              <div [id]="playerElementId"></div>
            </div>

            <!-- Timeline -->
            <div
              class="timeline"
              #timeline
              (mousedown)="onTimelineMouseDown($event)"
              (wheel)="onWheel($event)"
            >
              <button
                class="timeline-nav left"
                type="button"
                title="Scroll earlier"
                [disabled]="state.viewStart <= 0"
                (mousedown)="$event.stopPropagation()"
                (click)="panStep(-1, state)"
              >
                ‹
              </button>
              <button
                class="timeline-nav right"
                type="button"
                title="Scroll later"
                [disabled]="
                  state.viewStart + vm.visibleSpan(state) >= state.duration
                "
                (mousedown)="$event.stopPropagation()"
                (click)="panStep(1, state)"
              >
                ›
              </button>
              <div class="timeline-track">
                @for (lick of state.currentJam?.licks ?? []; track lick.id) {
                <div
                  class="lick-region"
                  [class.active]="lick.id === state.activeLickId"
                  [style.left.%]="leftPct(lick.startSeconds, state)"
                  [style.width.%]="
                    widthPct(lick.endSeconds - lick.startSeconds, state)
                  "
                ></div>
                } @if (state.markIn !== null && state.markOut !== null) {
                <div
                  class="mark-region"
                  [style.left.%]="leftPct(state.markIn, state)"
                  [style.width.%]="
                    widthPct(state.markOut - state.markIn, state)
                  "
                >
                  <div
                    class="mark-handle left"
                    title="Drag to move the start"
                    (mousedown)="onMarkHandleMouseDown($event, 'in')"
                  ></div>
                  <div
                    class="mark-handle right"
                    title="Drag to move the end"
                    (mousedown)="onMarkHandleMouseDown($event, 'out')"
                  ></div>
                </div>
                }
                <div
                  class="playhead"
                  [style.left.%]="leftPct(state.currentTime, state)"
                ></div>
              </div>
              <div class="timeline-times">
                <span>{{ formatTime(state.currentTime) }}</span>
                <span>{{ formatTime(state.duration) }}</span>
              </div>
            </div>

            <!-- Transport -->
            <div class="transport">
              <button
                class="transport-btn play"
                type="button"
                (click)="vm.togglePlay()"
              >
                {{ state.isPlaying ? '❚❚' : '▶' }}
              </button>

              <div class="control-group">
                <span class="control-label">Speed</span>
                <div class="control-row">
                  <button
                    class="transport-btn"
                    type="button"
                    title="Slower"
                    (click)="vm.stepPlaybackRate(-1)"
                  >
                    −
                  </button>
                  <span class="control-value"
                    >{{ ratePercent(state.playbackRate) }}%</span
                  >
                  <button
                    class="transport-btn"
                    type="button"
                    title="Faster"
                    (click)="vm.stepPlaybackRate(1)"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                class="transport-btn loop"
                type="button"
                [class.engaged]="state.loopEnabled"
                (click)="vm.toggleLoop()"
              >
                ⟳ loop
              </button>

              <div class="spacer"></div>

              <button
                class="transport-btn save"
                type="button"
                [disabled]="state.markIn === null || state.markOut === null"
                (click)="vm.saveLick()"
              >
                + Save Lick
              </button>
            </div>

            <p class="shortcut-hint">
              Drag on the timeline to mark a section, fine-tune with the pink
              handles, then save it. Scroll over the timeline to zoom in with
              mouse or 2 finger close-up method in with with trackpad. Press
              <kbd>←</kbd> (left arrow key) to jump to the start of the
              selection and play.
            </p>
          </div>

          <!-- Licks -->
          <div class="licks-panel">
            <h3 class="licks-title">Licks</h3>
            @if ((state.currentJam?.licks ?? []).length === 0) {
            <p class="status">
              No Licks yet — mark a section on the timeline and save it.
            </p>
            }
            <div class="lick-list">
              @for (lick of state.currentJam?.licks ?? []; track lick.id) {
              <div
                class="lick-item"
                [class.active]="lick.id === state.activeLickId"
                (click)="toggleLick(lick, state.activeLickId)"
              >
                <div class="lick-top">
                  @if (editingLickId() === lick.id) {
                  <input
                    class="lick-name-input"
                    type="text"
                    [value]="editingName()"
                    (click)="$event.stopPropagation()"
                    (input)="editingName.set($any($event.target).value)"
                    (keydown.enter)="commitRename(lick)"
                    (keydown.escape)="cancelRename()"
                    (blur)="commitRename(lick)"
                    autocomplete="off"
                  />
                  } @else {
                  <span class="lick-name">{{ lick.name }}</span>
                  <div class="lick-actions">
                    <button
                      class="lick-edit"
                      type="button"
                      title="Rename Lick"
                      (click)="startRename($event, lick)"
                    >
                      ✎
                    </button>
                    <button
                      class="lick-delete"
                      type="button"
                      title="Delete Lick"
                      (click)="deleteLick($event, lick)"
                    >
                      ✕
                    </button>
                  </div>
                  }
                </div>
                <span class="lick-range">
                  {{ formatTime(lick.startSeconds) }}–{{
                    formatTime(lick.endSeconds)
                  }}
                  @if (lick.playbackRate !== 1) { ·
                  {{ ratePercent(lick.playbackRate) }}% }
                </span>
              </div>
              }
            </div>
          </div>
        </div>
      </div>

      @if (lickPendingDelete(); as lick) {
      <lib-confirm-dialog
        title="Delete Lick"
        [message]="'Delete “' + lick.name + '”? This cannot be undone.'"
        (confirmed)="confirmDeleteLick(lick)"
        (cancelled)="lickPendingDelete.set(null)"
      ></lib-confirm-dialog>
      }
    </div>
    }
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
        max-width: 1600px;
        margin: 0 auto;
        padding: 2rem;
      }

      .breadcrumb {
        position: relative;
        z-index: 30;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-bottom: 1.25rem;
        padding: 0.6rem 1rem;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
      }

      .back-link {
        background: none;
        border: none;
        color: #45a29e;
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
        cursor: pointer;
        padding: 0;
      }

      .back-link:hover {
        color: #66fcf1;
      }

      .crumb-sep {
        color: #555;
      }

      .crumb-current {
        flex: 0 1 auto;
        min-width: 0;
        color: #c5c6c7;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* ── Categories control (breadcrumb, right) ── */
      .cat-control {
        position: relative;
        margin-left: auto;
        flex-shrink: 0;
      }

      .cat-btn {
        font-family: 'Fira Code', monospace;
        font-size: 0.78rem;
        color: #45a29e;
        background: rgba(69, 162, 158, 0.08);
        border: 1px solid rgba(69, 162, 158, 0.4);
        border-radius: 4px;
        padding: 4px 10px;
        cursor: pointer;
        white-space: nowrap;
        outline: none;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }

      .cat-btn:hover,
      .cat-btn.active {
        color: #66fcf1;
        border-color: #66fcf1;
        background: rgba(102, 252, 241, 0.08);
      }

      .cat-popover {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        z-index: 40;
        background: #0b0c10;
        border: 1px solid #45a29e;
        border-radius: 6px;
        padding: 0.75rem;
        width: min(280px, 80vw);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        cursor: default;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
      }

      .cat-title {
        font-family: 'Fira Code', monospace;
        font-size: 0.72rem;
        color: #888;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .cat-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }

      .cat-chip {
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        color: #c5c6c7;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid #333;
        border-radius: 20px;
        padding: 3px 10px;
        cursor: pointer;
        outline: none;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
      }

      .cat-chip:hover {
        border-color: #45a29e;
      }

      .cat-chip.selected {
        color: #66fcf1;
        border-color: #66fcf1;
        background: rgba(102, 252, 241, 0.08);
      }

      .cat-chip.new {
        color: #45a29e;
        border-style: dashed;
      }

      .cat-new-input {
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

      .cat-new-input:focus {
        border-color: #66fcf1;
      }

      .status {
        font-family: 'Fira Code', monospace;
        color: #888;
        font-size: 0.85rem;
      }

      /* Keeps the breadcrumb the same width as the video + licks block below it:
         capped video width (by viewport height) + gap + licks panel. */
      .player-page {
        max-width: calc(60vh * 16 / 9 + 1.25rem + 320px);
        margin: 0 auto;
      }

      /* ── Two-column shell ── */
      .player-shell {
        display: flex;
        gap: 1.25rem;
        align-items: flex-start;
      }

      .player-shell.hidden {
        display: none;
      }

      .player-main {
        flex: 1 1 auto;
        min-width: 0;
        /* Cap width by viewport height so the video never grows so tall that
           the transport and usage hint get pushed off-screen. */
        max-width: calc(60vh * 16 / 9);
        display: flex;
        flex-direction: column;
      }

      .video-frame {
        background: #000;
        border: 1px solid #333;
        border-radius: 8px;
        overflow: hidden;
        aspect-ratio: 16 / 9;
      }

      .video-frame ::ng-deep iframe,
      .video-frame > div {
        width: 100%;
        height: 100%;
        display: block;
      }

      /* ── Timeline ── */
      .timeline {
        position: relative;
        margin-top: 1rem;
        cursor: crosshair;
        user-select: none;
      }

      /* Pan buttons at the timeline edges — always present, fade out when there's
         nothing to scroll to (e.g. at 100% zoom, where the whole video already fits). */
      .timeline-nav {
        position: absolute;
        top: 0;
        height: 44px;
        width: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(11, 12, 16, 0.85);
        border: 1px solid #333;
        color: #66fcf1;
        font-size: 1.1rem;
        line-height: 1;
        cursor: pointer;
        z-index: 5;
        transition: background 0.15s, border-color 0.15s, opacity 0.15s;
      }

      .timeline-nav:hover:not(:disabled) {
        background: rgba(102, 252, 241, 0.15);
        border-color: #66fcf1;
      }

      .timeline-nav:disabled {
        opacity: 0.25;
        cursor: default;
      }

      .timeline-nav.left {
        left: -10px;
        border-radius: 4px 0 0 4px;
      }

      .timeline-nav.right {
        right: -10px;
        border-radius: 0 4px 4px 0;
      }

      .timeline-track {
        position: relative;
        height: 44px;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 4px;
        overflow: hidden;
      }

      .lick-region {
        position: absolute;
        top: 0;
        bottom: 0;
        background: rgba(69, 162, 158, 0.25);
        border-left: 1px solid #45a29e;
        border-right: 1px solid #45a29e;
      }

      .lick-region.active {
        background: rgba(102, 252, 241, 0.25);
        border-color: #66fcf1;
      }

      .mark-region {
        position: absolute;
        top: 0;
        bottom: 0;
        background: rgba(255, 0, 127, 0.2);
        border-left: 1px solid #ff007f;
        border-right: 1px solid #ff007f;
        transition: background 0.15s;
      }

      /* Brighten the fill on hover — borders stay 1px so the start/end don't thicken. */
      .mark-region:hover {
        background: rgba(255, 0, 127, 0.34);
      }

      /* Invisible drag zones over the start/end edges; the ew-resize cursor
         signals they can be dragged without visually thickening the border. */
      .mark-handle {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 10px;
        cursor: ew-resize;
      }

      .mark-handle.left {
        left: -5px;
      }

      .mark-handle.right {
        right: -5px;
      }

      .playhead {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #66fcf1;
        box-shadow: 0 0 6px rgba(102, 252, 241, 0.8);
        pointer-events: none;
      }

      .timeline-times {
        display: flex;
        justify-content: space-between;
        margin-top: 4px;
        font-family: 'Fira Code', monospace;
        font-size: 0.72rem;
        color: #888;
      }

      /* ── Transport ── */
      .transport {
        display: flex;
        align-items: flex-end;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin-top: 0.75rem;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 0.75rem 1rem;
      }

      .transport-btn {
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
        color: #c5c6c7;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid #333;
        border-radius: 4px;
        padding: 0.45rem 0.8rem;
        cursor: pointer;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
        white-space: nowrap;
      }

      .transport-btn:hover:not(:disabled) {
        border-color: #66fcf1;
        color: #66fcf1;
      }

      .transport-btn:disabled {
        opacity: 0.35;
        cursor: default;
      }

      .transport-btn.play {
        color: #66fcf1;
        min-width: 52px;
      }

      .transport-btn.loop.engaged {
        color: #ff007f;
        border-color: #ff007f;
        background: rgba(255, 0, 127, 0.1);
      }

      .transport-btn.save {
        color: #66fcf1;
        border-color: rgba(102, 252, 241, 0.4);
        background: rgba(102, 252, 241, 0.08);
      }

      .control-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
      }

      .control-label {
        font-family: 'Fira Code', monospace;
        font-size: 0.62rem;
        color: #888;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .control-row {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .control-value {
        font-family: 'Fira Code', monospace;
        color: #66fcf1;
        font-size: 0.9rem;
        min-width: 52px;
        text-align: center;
      }

      .spacer {
        flex: 1;
      }

      .shortcut-hint {
        font-family: 'Inter', sans-serif;
        color: #666;
        font-size: 0.78rem;
        margin: 0.75rem 0 0;
        line-height: 1.5;
      }

      .shortcut-hint kbd {
        font-family: 'Fira Code', monospace;
        color: #c5c6c7;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 3px;
        padding: 0 5px;
      }

      /* ── Licks panel ── */
      .licks-panel {
        flex: 0 0 320px;
        max-width: 320px;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 1rem 1.25rem;
        box-sizing: border-box;
      }

      .licks-title {
        font-family: 'Fira Code', monospace;
        color: #66fcf1;
        font-size: 0.95rem;
        margin: 0 0 0.75rem;
      }

      .lick-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 60vh;
        overflow-y: auto;
      }

      .lick-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 0.55rem 0.7rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid #333;
        border-radius: 4px;
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s;
      }

      .lick-item:hover {
        border-color: #45a29e;
      }

      .lick-item.active {
        border-color: #66fcf1;
        background: rgba(102, 252, 241, 0.07);
      }

      .lick-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .lick-name {
        font-family: 'Inter', sans-serif;
        color: #c5c6c7;
        font-size: 0.9rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
      }

      .lick-name-input {
        flex: 1;
        background: #0b0c10;
        border: 1px solid #66fcf1;
        border-radius: 4px;
        color: #c5c6c7;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        padding: 3px 6px;
        outline: none;
        min-width: 0;
      }

      .lick-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      .lick-edit,
      .lick-delete {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: 1px solid transparent;
        border-radius: 4px;
        font-size: 1.05rem;
        line-height: 1;
        padding: 3px 7px;
        cursor: pointer;
        transition: color 0.15s, border-color 0.15s;
      }

      .lick-edit {
        color: #45a29e;
      }

      .lick-edit:hover {
        color: #66fcf1;
        border-color: #66fcf1;
      }

      .lick-delete {
        color: #ff007f;
      }

      .lick-delete:hover {
        border-color: #ff007f;
      }

      .lick-range {
        font-family: 'Fira Code', monospace;
        color: #888;
        font-size: 0.75rem;
      }

      /* ── Responsive: stack on narrow screens ── */
      @media (max-width: 820px) {
        .player-shell {
          flex-direction: column;
        }

        .player-main {
          max-width: none;
        }

        .licks-panel {
          flex-basis: auto;
          max-width: none;
          width: 100%;
        }

        .lick-list {
          max-height: none;
        }
      }

      @media (max-width: 640px) {
        .page {
          padding: 1.25rem;
        }

        .transport {
          gap: 0.5rem;
        }
      }
    `,
  ],
})
export class JamPlayerComponent implements OnInit, OnDestroy {
  public readonly vm = inject(JaminiViewModel);
  private readonly playerService = inject(YoutubePlayerService);
  private readonly apiService = inject(JaminiApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  public readonly playerElementId = PLAYER_ELEMENT_ID;
  public readonly lickPendingDelete = signal<JaminiApi.Lick | null>(null);
  public readonly editingLickId = signal<string | null>(null);
  public readonly editingName = signal('');
  public readonly catPopoverOpen = signal(false);
  public readonly isAddingCategory = signal(false);
  public readonly newCategoryName = signal('');

  private readonly timelineRef =
    viewChild<ElementRef<HTMLDivElement>>('timeline');
  private jamSubscription: Subscription | null = null;
  private dragStartFraction: number | null = null;
  private removeDragListeners: (() => void) | null = null;

  public ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const jamId = this.route.snapshot.paramMap.get('id');
    if (!jamId) {
      this.backToLibrary();
      return;
    }

    this.vm.loadJam(jamId);
    this.vm.loadCategories();
    this.jamSubscription = this.vm.currentJam$
      .pipe(
        filter((detail): detail is JaminiApi.JamDetail => detail !== null),
        take(1)
      )
      .subscribe((detail) => {
        // Wait a tick so the @if branch has rendered the player host element
        setTimeout(() => this.createPlayer(detail.jam.youtubeVideoId));
      });
  }

  public ngOnDestroy(): void {
    this.jamSubscription?.unsubscribe();
    this.removeDragListeners?.();
    this.vm.leavePlayer();
  }

  public backToLibrary(): void {
    this.router.navigate(['/audio/jamini']);
  }

  public onDocumentClick(): void {
    this.catPopoverOpen.set(false);
    this.isAddingCategory.set(false);
  }

  public toggleCatPopover(): void {
    this.catPopoverOpen.update((open) => !open);
    this.isAddingCategory.set(false);
  }

  public toggleJamCategory(
    detail: JaminiApi.JamDetail,
    categoryId: string
  ): void {
    const categoryIds = detail.categoryIds.includes(categoryId)
      ? detail.categoryIds.filter((id) => id !== categoryId)
      : [...detail.categoryIds, categoryId];
    this.vm.setJamCategories({ jamId: detail.jam.id, categoryIds });
  }

  public createCategory(detail: JaminiApi.JamDetail): void {
    const name = this.newCategoryName().trim();
    if (!name) return;
    this.apiService.createCategory(name).subscribe((category) => {
      this.vm.loadCategories();
      this.vm.setJamCategories({
        jamId: detail.jam.id,
        categoryIds: [...detail.categoryIds, category.id],
      });
      this.newCategoryName.set('');
      this.isAddingCategory.set(false);
    });
  }

  public onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'))
      return;
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault();
      this.vm.togglePlay();
    } else if (event.code === 'ArrowLeft' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this.vm.restartRange();
    }
  }

  public toggleLick(lick: JaminiApi.Lick, activeLickId: string | null): void {
    if (lick.id === activeLickId) {
      this.vm.deselectLick();
    } else {
      this.vm.selectLick(lick);
    }
  }

  public startRename(event: Event, lick: JaminiApi.Lick): void {
    event.stopPropagation();
    this.editingLickId.set(lick.id);
    this.editingName.set(lick.name);
    setTimeout(() =>
      document.querySelector<HTMLInputElement>('.lick-name-input')?.focus()
    );
  }

  public commitRename(lick: JaminiApi.Lick): void {
    if (this.editingLickId() !== lick.id) return;
    const name = this.editingName().trim();
    this.editingLickId.set(null);
    if (!name || name === lick.name) return;
    this.vm.renameLick({ lick, name });
  }

  public cancelRename(): void {
    this.editingLickId.set(null);
  }

  public deleteLick(event: Event, lick: JaminiApi.Lick): void {
    event.stopPropagation();
    this.lickPendingDelete.set(lick);
  }

  public confirmDeleteLick(lick: JaminiApi.Lick): void {
    this.lickPendingDelete.set(null);
    this.vm.deleteLick(lick.id);
  }

  public onTimelineMouseDown(event: MouseEvent): void {
    const duration = this.vm.getState().duration;
    if (duration <= 0) return;

    this.dragStartFraction = this.eventFraction(event);
    const startTime = this.eventTime(event);

    const onMove = (moveEvent: MouseEvent): void => {
      const start = this.dragStartFraction;
      if (start === null) return;
      const current = this.eventFraction(moveEvent);
      if (Math.abs(current - start) > CLICK_DRAG_THRESHOLD) {
        const currentTime = this.eventTime(moveEvent);
        this.vm.setMarkRange(
          Math.min(startTime, currentTime),
          Math.max(startTime, currentTime)
        );
      }
    };

    const onUp = (upEvent: MouseEvent): void => {
      const start = this.dragStartFraction;
      this.dragStartFraction = null;
      if (start === null) return;
      const end = this.eventFraction(upEvent);
      if (Math.abs(end - start) <= CLICK_DRAG_THRESHOLD) {
        this.vm.seekTo(startTime);
      }
    };

    this.attachDragListeners(onMove, onUp);
  }

  public onMarkHandleMouseDown(event: MouseEvent, edge: 'in' | 'out'): void {
    event.stopPropagation();
    event.preventDefault();
    const duration = this.vm.getState().duration;
    if (duration <= 0) return;

    const onMove = (moveEvent: MouseEvent): void => {
      const seconds = this.eventTime(moveEvent);
      const { markIn, markOut } = this.vm.getState();
      if (edge === 'in' && markOut !== null) {
        this.vm.setMarkRange(
          Math.max(0, Math.min(seconds, markOut - MIN_MARK_GAP)),
          markOut
        );
      } else if (edge === 'out' && markIn !== null) {
        this.vm.setMarkRange(
          markIn,
          Math.min(duration, Math.max(seconds, markIn + MIN_MARK_GAP))
        );
      }
    };

    const onUp = (): void => this.removeDragListeners?.();

    this.attachDragListeners(onMove, onUp);
  }

  /** Wheel over the timeline: zoom (plain wheel / trackpad pinch) or pan (horizontal / shift). */
  public onWheel(event: WheelEvent): void {
    const s = this.vm.getState();
    if (s.duration <= 0) return;
    event.preventDefault();

    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    if (horizontal || event.shiftKey) {
      const deltaPx = horizontal ? event.deltaX : event.deltaY;
      const width =
        this.timelineRef()?.nativeElement.getBoundingClientRect().width ?? 1;
      this.vm.pan((deltaPx / width) * this.vm.visibleSpan(s));
    } else {
      const factor = Math.pow(1.0015, -event.deltaY);
      this.vm.zoomAt(factor, this.eventFraction(event));
    }
  }

  /** Scroll the timeline window by 30% of the visible span, left or right. */
  public panStep(direction: 1 | -1, state: JaminiState): void {
    this.vm.pan(direction * this.vm.visibleSpan(state) * 0.3);
  }

  /** Left offset (%) of an absolute time within the current zoom/pan window. */
  public leftPct(seconds: number, state: JaminiState): number {
    const span = this.vm.visibleSpan(state);
    return span > 0 ? ((seconds - state.viewStart) / span) * 100 : 0;
  }

  /** Width (%) of a duration within the current zoom window. */
  public widthPct(durationSeconds: number, state: JaminiState): number {
    const span = this.vm.visibleSpan(state);
    return span > 0 ? (durationSeconds / span) * 100 : 0;
  }

  public ratePercent(rate: number): number {
    return Math.round(rate * 100);
  }

  public formatTime(seconds: number): string {
    const total = Math.floor(seconds);
    const min = Math.floor(total / 60);
    const sec = total % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  private async createPlayer(videoId: string): Promise<void> {
    const { duration, availableRates } = await this.playerService.createPlayer(
      PLAYER_ELEMENT_ID,
      videoId
    );
    this.vm.onPlayerReady(duration, availableRates);
  }

  private attachDragListeners(
    onMove: (e: MouseEvent) => void,
    onUp: (e: MouseEvent) => void
  ): void {
    this.removeDragListeners?.();
    const upHandler = (upEvent: MouseEvent): void => {
      onUp(upEvent);
      this.removeDragListeners?.();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', upHandler);
    this.removeDragListeners = (): void => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', upHandler);
      this.removeDragListeners = null;
    };
  }

  private eventFraction(event: MouseEvent): number {
    const timeline = this.timelineRef()?.nativeElement;
    if (!timeline) return 0;
    const rect = timeline.getBoundingClientRect();
    return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  }

  /** Absolute time (seconds) under the cursor, accounting for zoom/pan. */
  private eventTime(event: MouseEvent): number {
    const s = this.vm.getState();
    return s.viewStart + this.eventFraction(event) * this.vm.visibleSpan(s);
  }
}
