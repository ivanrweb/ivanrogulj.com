import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, filter, take } from 'rxjs';
import { PracticeJamApi } from '@ivanrogulj.com/shared/data-access/model';
import { PracticeJamViewModel } from '../viewmodel/practice-jam.viewmodel';
import { YoutubePlayerService } from '../service/youtube-player.service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

const PLAYER_ELEMENT_ID = 'practice-jam-player';
/** Drags shorter than this (fraction of the timeline) count as a click-to-seek. */
const CLICK_DRAG_THRESHOLD = 0.005;

@Component({
  selector: 'lib-jam-player',
  standalone: true,
  imports: [AsyncPipe, ConfirmDialogComponent],
  template: `
    @if (vm.vm$ | async; as state) {
      <div class="page">
        <div class="breadcrumb">
          <button class="back-link" type="button" (click)="backToLibrary()">← Library</button>
          @if (state.currentJam; as detail) {
            <span class="crumb-sep">/</span>
            <span class="crumb-current">{{ detail.jam.name }}</span>
          }
        </div>

        @if (state.isLoadingJam) {
          <p class="status">Loading Jam…</p>
        }

        <div class="player-shell" [class.hidden]="!state.currentJam">
          <div class="video-frame">
            <div [id]="playerElementId"></div>
          </div>

          <!-- Timeline -->
          <div
            class="timeline"
            #timeline
            (mousedown)="onTimelineMouseDown($event)"
          >
            <div class="timeline-track">
              @for (phrase of state.currentJam?.phrases ?? []; track phrase.id) {
                <div
                  class="phrase-region"
                  [class.active]="phrase.id === state.activePhraseId"
                  [style.left.%]="toPercent(phrase.startSeconds, state.duration)"
                  [style.width.%]="toPercent(phrase.endSeconds - phrase.startSeconds, state.duration)"
                ></div>
              }
              @if (state.markIn !== null && state.markOut !== null) {
                <div
                  class="mark-region"
                  [style.left.%]="toPercent(state.markIn, state.duration)"
                  [style.width.%]="toPercent(state.markOut - state.markIn, state.duration)"
                ></div>
              }
              <div class="playhead" [style.left.%]="toPercent(state.currentTime, state.duration)"></div>
            </div>
            <div class="timeline-times">
              <span>{{ formatTime(state.currentTime) }}</span>
              <span>{{ formatTime(state.duration) }}</span>
            </div>
          </div>

          <!-- Transport -->
          <div class="transport">
            <button class="transport-btn play" type="button" (click)="vm.togglePlay()">
              {{ state.isPlaying ? '❚❚' : '▶' }}
            </button>

            <div class="speed-control">
              <button
                class="transport-btn"
                type="button"
                title="Slower"
                (click)="vm.stepPlaybackRate(-1)"
              >
                −
              </button>
              <span class="speed-value">{{ ratePercent(state.playbackRate) }}%</span>
              <button
                class="transport-btn"
                type="button"
                title="Faster"
                (click)="vm.stepPlaybackRate(1)"
              >
                +
              </button>
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

            <div class="mark-controls">
              <button class="transport-btn" type="button" (click)="vm.setMarkIn(state.currentTime)">
                [ start
              </button>
              <button
                class="transport-btn"
                type="button"
                [disabled]="state.markIn === null"
                (click)="vm.setMarkOut(state.currentTime)"
              >
                end ]
              </button>
              <button
                class="transport-btn save"
                type="button"
                [disabled]="state.markIn === null || state.markOut === null"
                (click)="vm.savePhrase()"
              >
                + Save Phrase
              </button>
            </div>
          </div>

          <!-- Phrases -->
          <div class="phrases-panel">
            <h3 class="phrases-title">Phrases</h3>
            @if ((state.currentJam?.phrases ?? []).length === 0) {
              <p class="status">
                No Phrases yet — drag on the timeline (or use [ start / end ]) to mark a section, then save it.
              </p>
            }
            <div class="phrase-list">
              @for (phrase of state.currentJam?.phrases ?? []; track phrase.id) {
                <div
                  class="phrase-item"
                  [class.active]="phrase.id === state.activePhraseId"
                  (click)="togglePhrase(phrase, state.activePhraseId)"
                >
                  <span class="phrase-name">{{ phrase.name }}</span>
                  <span class="phrase-range">
                    {{ formatTime(phrase.startSeconds) }}–{{ formatTime(phrase.endSeconds) }}
                  </span>
                  <button
                    class="phrase-delete"
                    type="button"
                    title="Delete Phrase"
                    (click)="deletePhrase($event, phrase)"
                  >
                    ✕
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        @if (phrasePendingDelete(); as phrase) {
          <lib-confirm-dialog
            title="Delete Phrase"
            [message]="'Delete “' + phrase.name + '”? This cannot be undone.'"
            (confirmed)="confirmDeletePhrase(phrase)"
            (cancelled)="phrasePendingDelete.set(null)"
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
        max-width: 1100px;
        margin: 0 auto;
        padding: 2rem;
      }

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-bottom: 1.25rem;
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
        color: #c5c6c7;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .status {
        font-family: 'Fira Code', monospace;
        color: #888;
        font-size: 0.85rem;
      }

      .player-shell.hidden {
        display: none;
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
        margin-top: 1rem;
        cursor: crosshair;
        user-select: none;
      }

      .timeline-track {
        position: relative;
        height: 44px;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 4px;
        overflow: hidden;
      }

      .phrase-region {
        position: absolute;
        top: 0;
        bottom: 0;
        background: rgba(69, 162, 158, 0.25);
        border-left: 1px solid #45a29e;
        border-right: 1px solid #45a29e;
      }

      .phrase-region.active {
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
      }

      .playhead {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #66fcf1;
        box-shadow: 0 0 6px rgba(102, 252, 241, 0.8);
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
        align-items: center;
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

      .speed-control {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .speed-value {
        font-family: 'Fira Code', monospace;
        color: #66fcf1;
        font-size: 0.9rem;
        min-width: 52px;
        text-align: center;
      }

      .spacer {
        flex: 1;
      }

      .mark-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Phrases ── */
      .phrases-panel {
        margin-top: 1.25rem;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 1rem 1.25rem;
      }

      .phrases-title {
        font-family: 'Fira Code', monospace;
        color: #66fcf1;
        font-size: 0.95rem;
        margin: 0 0 0.75rem;
      }

      .phrase-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .phrase-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.55rem 0.8rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid #333;
        border-radius: 4px;
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s;
      }

      .phrase-item:hover {
        border-color: #45a29e;
      }

      .phrase-item.active {
        border-color: #66fcf1;
        background: rgba(102, 252, 241, 0.07);
      }

      .phrase-name {
        font-family: 'Inter', sans-serif;
        color: #c5c6c7;
        font-size: 0.9rem;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .phrase-range {
        font-family: 'Fira Code', monospace;
        color: #888;
        font-size: 0.78rem;
      }

      .phrase-delete {
        background: none;
        border: 1px solid transparent;
        border-radius: 4px;
        color: #888;
        font-size: 0.72rem;
        padding: 2px 6px;
        cursor: pointer;
        transition: color 0.15s, border-color 0.15s;
      }

      .phrase-delete:hover {
        color: #ff007f;
        border-color: #ff007f;
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
  public readonly vm = inject(PracticeJamViewModel);
  private readonly playerService = inject(YoutubePlayerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  public readonly playerElementId = PLAYER_ELEMENT_ID;
  public readonly phrasePendingDelete = signal<PracticeJamApi.Phrase | null>(null);

  private readonly timelineRef = viewChild<ElementRef<HTMLDivElement>>('timeline');
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
    this.jamSubscription = this.vm.currentJam$
      .pipe(
        filter((detail): detail is PracticeJamApi.JamDetail => detail !== null),
        take(1),
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
    this.router.navigate(['/audio/practice-jam']);
  }

  public togglePhrase(phrase: PracticeJamApi.Phrase, activePhraseId: string | null): void {
    if (phrase.id === activePhraseId) {
      this.vm.deselectPhrase();
    } else {
      this.vm.selectPhrase(phrase);
    }
  }

  public deletePhrase(event: Event, phrase: PracticeJamApi.Phrase): void {
    event.stopPropagation();
    this.phrasePendingDelete.set(phrase);
  }

  public confirmDeletePhrase(phrase: PracticeJamApi.Phrase): void {
    this.phrasePendingDelete.set(null);
    this.vm.deletePhrase(phrase.id);
  }

  public onTimelineMouseDown(event: MouseEvent): void {
    const duration = this.vm.getState().duration;
    if (duration <= 0) return;

    this.dragStartFraction = this.eventFraction(event);

    const onMove = (moveEvent: MouseEvent): void => {
      const start = this.dragStartFraction;
      if (start === null) return;
      const current = this.eventFraction(moveEvent);
      if (Math.abs(current - start) > CLICK_DRAG_THRESHOLD) {
        this.vm.setMarkRange(Math.min(start, current) * duration, Math.max(start, current) * duration);
      }
    };

    const onUp = (upEvent: MouseEvent): void => {
      const start = this.dragStartFraction;
      this.dragStartFraction = null;
      this.removeDragListeners?.();
      if (start === null) return;
      const end = this.eventFraction(upEvent);
      if (Math.abs(end - start) <= CLICK_DRAG_THRESHOLD) {
        this.vm.seekTo(start * duration);
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    this.removeDragListeners = (): void => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      this.removeDragListeners = null;
    };
  }

  public toPercent(seconds: number, duration: number): number {
    if (duration <= 0) return 0;
    return Math.min(100, Math.max(0, (seconds / duration) * 100));
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
    const { duration, availableRates } = await this.playerService.createPlayer(PLAYER_ELEMENT_ID, videoId);
    this.vm.onPlayerReady(duration, availableRates);
  }

  private eventFraction(event: MouseEvent): number {
    const timeline = this.timelineRef()?.nativeElement;
    if (!timeline) return 0;
    const rect = timeline.getBoundingClientRect();
    return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  }
}
