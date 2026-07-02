import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { catchError, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { PracticeJamApi } from '@ivanrogulj.com/shared/data-access/model';
import { PracticeJamApiService } from '../service/practice-jam-api.service';
import { YoutubePlayerService } from '../service/youtube-player.service';

export interface PracticeJamState {
  // Library
  jams: PracticeJamApi.JamListItem[];
  setlists: PracticeJamApi.Setlist[];
  activeSetlistId: string | null;
  isLoadingLibrary: boolean;
  libraryError: string | null;

  // Current Jam (player page)
  currentJam: PracticeJamApi.JamDetail | null;
  isLoadingJam: boolean;

  // Player
  currentTime: number;
  duration: number;
  availableRates: number[];
  playbackRate: number;
  isPlaying: boolean;
  loopEnabled: boolean;
  activePhraseId: string | null;
  markIn: number | null;
  markOut: number | null;
}

const defaultState: PracticeJamState = {
  jams: [],
  setlists: [],
  activeSetlistId: null,
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
  activePhraseId: null,
  markIn: null,
  markOut: null,
};

@Injectable({ providedIn: 'root' })
export class PracticeJamViewModel extends ComponentStore<PracticeJamState> {
  private readonly apiService = inject(PracticeJamApiService);
  private readonly playerService = inject(YoutubePlayerService);

  public readonly vm$ = this.select((s) => s);
  public readonly jams$ = this.select((s) => s.jams);
  public readonly setlists$ = this.select((s) => s.setlists);
  public readonly activeSetlistId$ = this.select((s) => s.activeSetlistId);
  public readonly filteredJams$ = this.select(
    this.jams$,
    this.activeSetlistId$,
    (jams, setlistId) => (setlistId === null ? jams : jams.filter((j) => j.setlistIds.includes(setlistId))),
  );
  public readonly currentJam$ = this.select((s) => s.currentJam);
  public readonly phrases$ = this.select((s) => s.currentJam?.phrases ?? []);
  public readonly activePhrase$ = this.select(
    (s) => s.currentJam?.phrases.find((p) => p.id === s.activePhraseId) ?? null,
  );

  /** The range the loop applies to: the active Phrase, or the unsaved mark-in/out selection. */
  public readonly loopRange$ = this.select((s) => {
    const phrase = s.currentJam?.phrases.find((p) => p.id === s.activePhraseId);
    if (phrase) return { start: phrase.startSeconds, end: phrase.endSeconds };
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

  public getState(): PracticeJamState {
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

  public readonly loadSetlists = this.effect<void>((trigger$) =>
    trigger$.pipe(
      switchMap(() =>
        this.apiService.getSetlists().pipe(
          tap((setlists) => this.patchState({ setlists })),
          catchError(() => of(null)),
        ),
      ),
    ),
  );

  public setActiveSetlist(setlistId: string | null): void {
    this.patchState({ activeSetlistId: setlistId });
  }

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

  // ── Current Jam / player ──

  public readonly loadJam = this.effect<string>((jamId$) =>
    jamId$.pipe(
      tap(() =>
        this.patchState({
          isLoadingJam: true,
          currentJam: null,
          activePhraseId: null,
          markIn: null,
          markOut: null,
          loopEnabled: false,
          currentTime: 0,
          duration: 0,
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

  public setMarkIn(seconds: number): void {
    this.patchState((s) => ({
      markIn: seconds,
      markOut: s.markOut !== null && s.markOut <= seconds ? null : s.markOut,
      activePhraseId: null,
    }));
  }

  public setMarkOut(seconds: number): void {
    const { markIn } = this.get();
    if (markIn === null || seconds <= markIn) return;
    this.patchState({ markOut: seconds, activePhraseId: null });
  }

  public setMarkRange(start: number, end: number): void {
    this.patchState({ markIn: start, markOut: end, activePhraseId: null });
  }

  public clearMarks(): void {
    this.patchState({ markIn: null, markOut: null });
  }

  public selectPhrase(phrase: PracticeJamApi.Phrase): void {
    this.patchState({ activePhraseId: phrase.id, markIn: null, markOut: null });
    this.applyPlaybackRate(this.closestAvailableRate(phrase.playbackRate));
    this.seekTo(phrase.startSeconds);
  }

  public deselectPhrase(): void {
    this.patchState({ activePhraseId: null });
  }

  public readonly savePhrase = this.effect<void>((trigger$) =>
    trigger$.pipe(
      switchMap(() => {
        const { currentJam, markIn, markOut, playbackRate } = this.get();
        if (!currentJam || markIn === null || markOut === null || markOut <= markIn) {
          return of(null);
        }
        return this.apiService
          .addPhrase(currentJam.jam.id, { startSeconds: markIn, endSeconds: markOut, playbackRate })
          .pipe(
            tap((phrase) =>
              this.patchState((s) => ({
                currentJam: s.currentJam
                  ? { ...s.currentJam, phrases: [...s.currentJam.phrases, phrase] }
                  : s.currentJam,
                activePhraseId: phrase.id,
                markIn: null,
                markOut: null,
              })),
            ),
            catchError(() => of(null)),
          );
      }),
    ),
  );

  public readonly deletePhrase = this.effect<string>((phraseId$) =>
    phraseId$.pipe(
      switchMap((phraseId) =>
        this.apiService.deletePhrase(phraseId).pipe(
          tap(() =>
            this.patchState((s) => ({
              currentJam: s.currentJam
                ? { ...s.currentJam, phrases: s.currentJam.phrases.filter((p) => p.id !== phraseId) }
                : s.currentJam,
              activePhraseId: s.activePhraseId === phraseId ? null : s.activePhraseId,
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
      activePhraseId: null,
      markIn: null,
      markOut: null,
      currentTime: 0,
      duration: 0,
    });
  }

  // ── Internal effects ──

  private readonly updateTimeFromPlayer = this.effect<number>((time$) =>
    time$.pipe(tap((currentTime) => this.patchState({ currentTime }))),
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
