import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { catchError, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { JaminiApi } from '@ivanrogulj.com/shared/data-access/model';
import { JaminiApiService } from '../service/jamini-api.service';
import { YoutubePlayerService } from '../service/youtube-player.service';

export interface JaminiState {
  // Library
  jams: JaminiApi.JamListItem[];
  categories: JaminiApi.Category[];
  activeCategoryId: string | null;
  isLoadingLibrary: boolean;
  libraryError: string | null;

  // Current Jam (player page)
  currentJam: JaminiApi.JamDetail | null;
  isLoadingJam: boolean;

  // Player
  currentTime: number;
  duration: number;
  availableRates: number[];
  playbackRate: number;
  isPlaying: boolean;
  loopEnabled: boolean;
  activeLickId: string | null;
  markIn: number | null;
  markOut: number | null;

  // Timeline zoom (1 = whole video fits; higher = zoomed in) and pan window start (seconds)
  zoom: number;
  viewStart: number;
}

/** Max timeline zoom factor. */
const MAX_ZOOM = 40;

const defaultState: JaminiState = {
  jams: [],
  categories: [],
  activeCategoryId: null,
  isLoadingLibrary: false,
  libraryError: null,
  currentJam: null,
  isLoadingJam: false,
  currentTime: 0,
  duration: 0,
  availableRates: [1],
  playbackRate: 1,
  isPlaying: false,
  loopEnabled: false,
  activeLickId: null,
  markIn: null,
  markOut: null,
  zoom: 1,
  viewStart: 0,
};

@Injectable({ providedIn: 'root' })
export class JaminiViewModel extends ComponentStore<JaminiState> {
  private readonly apiService = inject(JaminiApiService);
  private readonly playerService = inject(YoutubePlayerService);

  public readonly vm$ = this.select((s) => s);
  public readonly jams$ = this.select((s) => s.jams);
  public readonly categories$ = this.select((s) => s.categories);
  public readonly activeCategoryId$ = this.select((s) => s.activeCategoryId);
  public readonly filteredJams$ = this.select(
    this.jams$,
    this.activeCategoryId$,
    (jams, categoryId) => (categoryId === null ? jams : jams.filter((j) => j.categoryIds.includes(categoryId))),
  );
  public readonly currentJam$ = this.select((s) => s.currentJam);
  public readonly licks$ = this.select((s) => s.currentJam?.licks ?? []);
  public readonly activeLick$ = this.select(
    (s) => s.currentJam?.licks.find((p) => p.id === s.activeLickId) ?? null,
  );

  /** The range the loop applies to: the active Lick, or the unsaved mark-in/out selection. */
  public readonly loopRange$ = this.select((s) => {
    const lick = s.currentJam?.licks.find((p) => p.id === s.activeLickId);
    if (lick) return { start: lick.startSeconds, end: lick.endSeconds };
    if (s.markIn !== null && s.markOut !== null && s.markOut > s.markIn) {
      return { start: s.markIn, end: s.markOut };
    }
    return null;
  });

  constructor() {
    super(defaultState);

    // Playhead + play state from the player service
    this.updateTimeFromPlayer(this.playerService.time$);
    this.patchIsPlaying(this.playerService.playing$);

    // Loop: when enabled and the playhead passes the end of the range, jump back to start
    this.loopWatcher(this.playerService.time$);
  }

  public getState(): JaminiState {
    return this.get();
  }

  // ── Library ──

  public readonly loadLibrary = this.effect<void>((trigger$) =>
    trigger$.pipe(
      tap(() => this.patchState({ isLoadingLibrary: true, libraryError: null })),
      switchMap(() =>
        this.apiService.getJams().pipe(
          tap((jams) => this.patchState({ jams, isLoadingLibrary: false })),
          catchError(() => {
            this.patchState({ isLoadingLibrary: false, libraryError: 'Could not load your library.' });
            return of(null);
          }),
        ),
      ),
    ),
  );

  public readonly loadCategories = this.effect<void>((trigger$) =>
    trigger$.pipe(
      switchMap(() =>
        this.apiService.getCategories().pipe(
          tap((categories) => this.patchState({ categories })),
          catchError(() => of(null)),
        ),
      ),
    ),
  );

  public setActiveCategory(categoryId: string | null): void {
    this.patchState({ activeCategoryId: categoryId });
  }

  public readonly deleteCategory = this.effect<string>((categoryId$) =>
    categoryId$.pipe(
      switchMap((categoryId) =>
        this.apiService.deleteCategory(categoryId).pipe(
          tap(() =>
            this.patchState((s) => ({
              categories: s.categories.filter((c) => c.id !== categoryId),
              activeCategoryId: s.activeCategoryId === categoryId ? null : s.activeCategoryId,
              jams: s.jams.map((j) => ({ ...j, categoryIds: j.categoryIds.filter((id) => id !== categoryId) })),
            })),
          ),
          catchError(() => of(null)),
        ),
      ),
    ),
  );

  public readonly deleteJam = this.effect<string>((jamId$) =>
    jamId$.pipe(
      switchMap((jamId) =>
        this.apiService.deleteJam(jamId).pipe(
          tap(() => this.patchState((s) => ({ jams: s.jams.filter((j) => j.id !== jamId) }))),
          catchError(() => of(null)),
        ),
      ),
    ),
  );

  public readonly setJamCategories = this.effect<{ jamId: string; categoryIds: string[] }>((assignment$) =>
    assignment$.pipe(
      switchMap(({ jamId, categoryIds }) =>
        this.apiService.setJamCategories(jamId, categoryIds).pipe(
          tap((savedIds) =>
            this.patchState((s) => ({
              jams: s.jams.map((j) => (j.id === jamId ? { ...j, categoryIds: savedIds } : j)),
              currentJam:
                s.currentJam && s.currentJam.jam.id === jamId
                  ? { ...s.currentJam, categoryIds: savedIds }
                  : s.currentJam,
            })),
          ),
          catchError(() => of(null)),
        ),
      ),
    ),
  );

  // ── Current Jam / player ──

  public readonly loadJam = this.effect<string>((jamId$) =>
    jamId$.pipe(
      tap(() =>
        this.patchState({
          isLoadingJam: true,
          currentJam: null,
          activeLickId: null,
          markIn: null,
          markOut: null,
          loopEnabled: false,
          currentTime: 0,
          duration: 0,
          zoom: 1,
          viewStart: 0,
        }),
      ),
      switchMap((jamId) =>
        this.apiService.getJam(jamId).pipe(
          tap((detail) => this.patchState({ currentJam: detail, isLoadingJam: false })),
          catchError(() => {
            this.patchState({ isLoadingJam: false });
            return of(null);
          }),
        ),
      ),
    ),
  );

  public onPlayerReady(duration: number, availableRates: number[]): void {
    this.patchState({ duration, availableRates, playbackRate: 1 });

    // Persist duration the first time we learn it, so the library can show it later
    const jam = this.get().currentJam;
    if (jam && jam.jam.durationSeconds === null && duration > 0) {
      this.apiService.updateJam(jam.jam.id, { durationSeconds: duration }).subscribe();
    }
  }

  public togglePlay(): void {
    if (this.get().isPlaying) {
      this.playerService.pause();
    } else {
      this.playerService.play();
    }
  }

  public seekTo(seconds: number): void {
    this.playerService.seekTo(seconds);
    this.patchState({ currentTime: seconds });
  }

  public stepPlaybackRate(direction: 1 | -1): void {
    const { availableRates, playbackRate } = this.get();
    const sorted = [...availableRates].sort((a, b) => a - b);
    const index = sorted.indexOf(playbackRate);
    const nextIndex = Math.min(sorted.length - 1, Math.max(0, index + direction));
    this.applyPlaybackRate(sorted[nextIndex]);
  }

  public applyPlaybackRate(rate: number): void {
    this.playerService.setPlaybackRate(rate);
    this.patchState({ playbackRate: rate });
  }

  public toggleLoop(): void {
    this.patchState((s) => ({ loopEnabled: !s.loopEnabled }));
  }

  // ── Timeline zoom / pan ──

  /** Visible span of the timeline in seconds at the current zoom. */
  public visibleSpan(state: JaminiState = this.get()): number {
    return state.zoom > 0 ? state.duration / state.zoom : state.duration;
  }

  /**
   * Zoom by `factor`, keeping the time under `fraction` (0–1 across the visible
   * timeline) fixed under the cursor. `fraction` = 0.5 zooms around the centre.
   */
  public zoomAt(factor: number, fraction: number): void {
    const s = this.get();
    if (s.duration <= 0) return;
    const oldSpan = this.visibleSpan(s);
    const focusTime = s.viewStart + fraction * oldSpan;
    const zoom = Math.min(MAX_ZOOM, Math.max(1, s.zoom * factor));
    const newSpan = s.duration / zoom;
    const viewStart = Math.min(Math.max(0, focusTime - fraction * newSpan), Math.max(0, s.duration - newSpan));
    this.patchState({ zoom, viewStart });
  }

  /** Shift the visible window by `deltaSeconds` (positive = scroll right). */
  public pan(deltaSeconds: number): void {
    const s = this.get();
    const span = this.visibleSpan(s);
    const viewStart = Math.min(Math.max(0, s.viewStart + deltaSeconds), Math.max(0, s.duration - span));
    this.patchState({ viewStart });
  }

  public setMarkIn(seconds: number): void {
    this.patchState((s) => ({
      markIn: seconds,
      markOut: s.markOut !== null && s.markOut <= seconds ? null : s.markOut,
      activeLickId: null,
    }));
  }

  public setMarkOut(seconds: number): void {
    const { markIn } = this.get();
    if (markIn === null || seconds <= markIn) return;
    this.patchState({ markOut: seconds, activeLickId: null });
  }

  public setMarkRange(start: number, end: number): void {
    this.patchState({ markIn: start, markOut: end, activeLickId: null });
  }

  public clearMarks(): void {
    this.patchState({ markIn: null, markOut: null });
  }

  public selectLick(lick: JaminiApi.Lick): void {
    this.patchState({ activeLickId: lick.id, markIn: null, markOut: null });
    this.applyPlaybackRate(this.closestAvailableRate(lick.playbackRate));
    this.seekTo(lick.startSeconds);
  }

  public deselectLick(): void {
    this.patchState({ activeLickId: null });
  }

  /** Jump to the start of the active Lick (or unsaved mark selection) and start playing. */
  public restartRange(): void {
    const s = this.get();
    const lick = s.currentJam?.licks.find((p) => p.id === s.activeLickId);
    const start = lick
      ? lick.startSeconds
      : s.markIn !== null && s.markOut !== null && s.markOut > s.markIn
        ? s.markIn
        : null;
    if (start === null) return;
    this.seekTo(start);
    this.playerService.play();
  }

  public readonly renameLick = this.effect<{ lick: JaminiApi.Lick; name: string }>((input$) =>
    input$.pipe(
      switchMap(({ lick, name }) =>
        this.apiService
          .updateLick(lick.id, {
            name,
            startSeconds: lick.startSeconds,
            endSeconds: lick.endSeconds,
            playbackRate: lick.playbackRate,
          })
          .pipe(
            tap((updated) =>
              this.patchState((s) => ({
                currentJam: s.currentJam
                  ? { ...s.currentJam, licks: s.currentJam.licks.map((p) => (p.id === updated.id ? updated : p)) }
                  : s.currentJam,
              })),
            ),
            catchError(() => of(null)),
          ),
      ),
    ),
  );

  public readonly saveLick = this.effect<void>((trigger$) =>
    trigger$.pipe(
      switchMap(() => {
        const { currentJam, markIn, markOut, playbackRate } = this.get();
        if (!currentJam || markIn === null || markOut === null || markOut <= markIn) {
          return of(null);
        }
        return this.apiService
          .addLick(currentJam.jam.id, { startSeconds: markIn, endSeconds: markOut, playbackRate })
          .pipe(
            tap((lick) =>
              this.patchState((s) => ({
                currentJam: s.currentJam
                  ? { ...s.currentJam, licks: [...s.currentJam.licks, lick] }
                  : s.currentJam,
                activeLickId: lick.id,
                markIn: null,
                markOut: null,
              })),
            ),
            catchError(() => of(null)),
          );
      }),
    ),
  );

  public readonly deleteLick = this.effect<string>((lickId$) =>
    lickId$.pipe(
      switchMap((lickId) =>
        this.apiService.deleteLick(lickId).pipe(
          tap(() =>
            this.patchState((s) => ({
              currentJam: s.currentJam
                ? { ...s.currentJam, licks: s.currentJam.licks.filter((p) => p.id !== lickId) }
                : s.currentJam,
              activeLickId: s.activeLickId === lickId ? null : s.activeLickId,
            })),
          ),
          catchError(() => of(null)),
        ),
      ),
    ),
  );

  public leavePlayer(): void {
    this.playerService.destroyPlayer();
    this.patchState({
      currentJam: null,
      isPlaying: false,
      loopEnabled: false,
      activeLickId: null,
      markIn: null,
      markOut: null,
      currentTime: 0,
      duration: 0,
      zoom: 1,
      viewStart: 0,
    });
  }

  // ── Internal effects ──

  private readonly updateTimeFromPlayer = this.effect<number>((time$) =>
    time$.pipe(
      withLatestFrom(this.loopRange$, this.select((s) => s.loopEnabled)),
      tap(([currentTime, range, loopEnabled]) => {
        // When looping, the 100ms poll can report a time just past the loop end.
        // Clamp it to the loop start here — the single writer of currentTime — so
        // the playhead never renders beyond the end marker, regardless of effect order.
        const clamped = loopEnabled && range && currentTime >= range.end ? range.start : currentTime;
        this.patchState({ currentTime: clamped });
      }),
    ),
  );

  private readonly patchIsPlaying = this.effect<boolean>((playing$) =>
    playing$.pipe(tap((isPlaying) => this.patchState({ isPlaying }))),
  );

  private readonly loopWatcher = this.effect<number>((time$) =>
    time$.pipe(
      withLatestFrom(this.loopRange$, this.select((s) => s.loopEnabled)),
      tap(([time, range, loopEnabled]) => {
        if (loopEnabled && range && time >= range.end) {
          this.playerService.seekTo(range.start);
        }
      }),
    ),
  );

  private closestAvailableRate(rate: number): number {
    const { availableRates } = this.get();
    return availableRates.reduce(
      (closest, candidate) => (Math.abs(candidate - rate) < Math.abs(closest - rate) ? candidate : closest),
      availableRates[0] ?? 1,
    );
  }
}
