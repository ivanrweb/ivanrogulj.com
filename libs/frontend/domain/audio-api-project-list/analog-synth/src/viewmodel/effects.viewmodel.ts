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
}

const DEFAULT_STATE: EffectsState = {
  reverb: { mix: 0.5, decay: 2.0, enabled: false },
  delay: { time: 0.5, feedback: 0.3, mix: 1, enabled: false },
  distortion: { amount: 0.5, tone: 1.0, mix: 1.0, enabled: false },
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
            // If disabled, send clean signal (stavljamo mix na 0)
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

  // Reverb Actions
  public updateReverbMix(mix: number): void {
    this.patchState((state) => ({ reverb: { ...state.reverb, mix } }));
  }

  public updateReverbDecay(decay: number): void {
    this.patchState((state) => ({ reverb: { ...state.reverb, decay } }));
  }

  // Delay Actions
  public updateDelayTime(time: number): void {
    this.patchState((state) => ({ delay: { ...state.delay, time } }));
  }

  public updateDelayFeedback(feedback: number): void {
    this.patchState((state) => ({ delay: { ...state.delay, feedback } }));
  }

  public updateDelayMix(mix: number): void {
    this.patchState((state) => ({ delay: { ...state.delay, mix } }));
  }

  // Toggle actions

  public toggleReverb(enabled: boolean): void {
    this.patchState((state) => ({ reverb: { ...state.reverb, enabled } }));
  }

  public toggleDelay(enabled: boolean): void {
    this.patchState((state) => ({ delay: { ...state.delay, enabled } }));
  }

  public toggleDistortion(enabled: boolean): void {
    this.patchState((state) => ({
      distortion: { ...state.distortion, enabled },
    }));
  }
}
