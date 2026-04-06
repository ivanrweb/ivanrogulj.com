import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { debounceTime, distinctUntilChanged, Observable, tap } from 'rxjs';
import { AudioContextService } from '../service/audio-context.service';

// Defined states for ALL effects here
export interface EffectsState {
  reverb: {
    mix: number;
    decay: number;
    enabled: boolean;
  };
  delay: {
    time: number;
    feedback: number;
    mix: number;
    enabled: boolean;
  };
  distortion: {
    amount: number; // 0.0 - 1.0
    tone: number;
    mix: number;
    enabled: boolean;
  };
  chorus: {
    rate: number;
    depth: number;
    mix: number;
    enabled: boolean;
  };
}

const DEFAULT_STATE: EffectsState = {
  reverb: { mix: 0.5, decay: 2.0, enabled: true },
  delay: { time: 0.5, feedback: 0.3, mix: 1, enabled: false },
  distortion: { amount: 0.5, tone: 1.0, mix: 1.0, enabled: false },
  chorus: { rate: 0.27, depth: 0.2, mix: 0.15, enabled: false },
};

@Injectable({ providedIn: 'root' })
export class EffectsViewModel extends ComponentStore<EffectsState> {
  public readonly vm$: Observable<EffectsState> = this.select((state) => state);
  private audioService = inject(AudioContextService);

  constructor() {
    super(DEFAULT_STATE);

    // When VM state is changed, update Audio Service
    this.syncDistortion(this.select((s) => s.distortion));
    this.syncDelay(this.select((s) => s.delay));
    this.syncReverb(this.select((s) => s.reverb));
    this.syncChorus(this.select((s) => s.chorus));
  }

  public refreshState(): void {
    const state = this.get();

    console.log('Refreshing Effects State:', state);

    // Manually trigger update of service with current values
    if (state.distortion.enabled) {
      this.audioService.setDistortionParams(
        state.distortion.amount,
        state.distortion.tone,
        state.distortion.mix
      );
    }
    if (state.reverb.enabled) {
      this.audioService.setReverbParams(state.reverb.mix, state.reverb.decay);
    }
    if (state.delay.enabled) {
      this.audioService.setDelayParams(
        state.delay.time,
        state.delay.feedback,
        state.delay.mix
      );
    }
  }

  // Distortion sync
  private readonly syncDistortion = this.effect(
    (state$: Observable<EffectsState['distortion']>) =>
      state$.pipe(
        distinctUntilChanged(
          (prev, curr) =>
            prev.amount === curr.amount &&
            prev.tone === curr.tone &&
            prev.mix === curr.mix &&
            prev.enabled === curr.enabled
        ),
        tap((state) => {
          if (state.enabled) {
            this.audioService.setDistortionParams(
              state.amount,
              state.tone,
              state.mix
            );
          } else {
            // If disabled, send clean signal
            this.audioService.setDistortionParams(state.amount, state.tone, 0);
          }
        })
      )
  );

  // Delay sync
  private readonly syncDelay = this.effect(
    (state$: Observable<EffectsState['delay']>) =>
      state$.pipe(
        distinctUntilChanged(
          (prev, curr) =>
            prev.time === curr.time &&
            prev.feedback === curr.feedback &&
            prev.mix === curr.mix &&
            prev.enabled === curr.enabled
        ),
        tap((state) => {
          if (state.enabled) {
            this.audioService.setDelayParams(
              state.time,
              state.feedback,
              state.mix
            );
          } else {
            // If disabled, reduce mix to 0
            this.audioService.setDelayParams(state.time, 0, 0);
          }
        })
      )
  );

  // Chorus sync
  private readonly syncChorus = this.effect(
    (state$: Observable<EffectsState['chorus']>) =>
      state$.pipe(
        distinctUntilChanged(
          (prev, curr) =>
            prev.rate === curr.rate &&
            prev.depth === curr.depth &&
            prev.mix === curr.mix &&
            prev.enabled === curr.enabled
        ),
        tap((state) => {
          if (state.enabled) {
            this.audioService.setChorusParams(
              state.rate,
              state.depth,
              state.mix
            );
          } else {
            // If disabled, reduce mix to 0
            this.audioService.setChorusParams(state.rate, state.depth, 0);
          }
        })
      )
  );

  // Reverb sync
  private readonly syncReverb = this.effect(
    (state$: Observable<EffectsState['reverb']>) =>
      state$.pipe(
        distinctUntilChanged(
          (prev, curr) =>
            prev.mix === curr.mix &&
            prev.decay === curr.decay &&
            prev.enabled === curr.enabled
        ),
        // Wait 100ms to stop turning the knob before it starts with calculation
        //Hundreds of calls on every knob turn change adds weight on CPU here, so debounce is needed
        debounceTime(100),
        tap((state) => {
          if (state.enabled) {
            this.audioService.setReverbParams(state.mix, state.decay);
          } else {
            // If disabled, reduce mix to 0
            this.audioService.setReverbParams(0, state.decay);
          }
        })
      )
  );

  // --- ACTIONS (Methods called from UI or MIDI) ---

  //Distortion Actions
  public updateDistortionAmount(amount: number): void {
    this.patchState((s) => ({ distortion: { ...s.distortion, amount } }));
  }

  public updateDistortionTone(tone: number): void {
    this.patchState((s) => ({ distortion: { ...s.distortion, tone } }));
  }

  public updateDistortionMix(mix: number): void {
    this.patchState((s) => ({ distortion: { ...s.distortion, mix } }));
  }

  public toggleDistortion(enabled: boolean): void {
    this.patchState((state) => ({
      distortion: { ...state.distortion, enabled },
    }));
  }

  // Reverb Actions
  public toggleReverb(enabled: boolean): void {
    this.patchState((state) => ({ reverb: { ...state.reverb, enabled } }));
  }

  public updateReverbMix(mix: number): void {
    this.patchState((state) => ({ reverb: { ...state.reverb, mix } }));
  }

  public updateReverbDecay(decay: number): void {
    this.patchState((state) => ({ reverb: { ...state.reverb, decay } }));
  }

  // Delay Actions
  public toggleDelay(enabled: boolean): void {
    this.patchState((state) => ({ delay: { ...state.delay, enabled } }));
  }

  public updateDelayTime(time: number): void {
    this.patchState((state) => ({ delay: { ...state.delay, time } }));
  }

  public updateDelayFeedback(feedback: number): void {
    this.patchState((state) => ({ delay: { ...state.delay, feedback } }));
  }

  public updateDelayMix(mix: number): void {
    this.patchState((state) => ({ delay: { ...state.delay, mix } }));
  }

  // Chorus Actions
  public toggleChorus(enabled: boolean): void {
    this.patchState((state) => ({
      chorus: { ...state.chorus, enabled },
    }));
  }

  public updateChorusRate(rate: number): void {
    this.patchState((s) => ({ chorus: { ...s.chorus, rate } }));
  }

  public updateChorusDepth(depth: number): void {
    this.patchState((s) => ({ chorus: { ...s.chorus, depth } }));
  }

  public updateChorusMix(mix: number): void {
    this.patchState((s) => ({ chorus: { ...s.chorus, mix } }));
  }
}
