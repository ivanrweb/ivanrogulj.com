import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, tap } from 'rxjs';
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
    enabled: boolean;
  };
}

const DEFAULT_STATE: EffectsState = {
  reverb: { mix: 0.5, decay: 2.0, enabled: false },
  delay: { time: 0.5, feedback: 0.3, mix: 1, enabled: false },
  distortion: { amount: 0.5, enabled: false },
};

@Injectable({ providedIn: 'root' })
export class EffectsViewModel extends ComponentStore<EffectsState> {
  private audioService = inject(AudioContextService);

  constructor() {
    super(DEFAULT_STATE);

    // When VM state is changed, update Audio Service
    this.syncAudioParams(this.select((s) => s));
  }

  public refreshState(): void {
    const state = this.get();

    console.log('Refreshing Effects State:', state);

    // Manually trigger update of service with current values
    if (state.distortion.enabled) {
      this.audioService.setDistortionParams(state.distortion.amount);
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

  public readonly syncAudioParams = this.effect(
    (state$: Observable<EffectsState>) =>
      state$.pipe(
        tap((state) => {
          //Distortion sync
          if (state.distortion.enabled) {
            this.audioService.setDistortionParams(state.distortion.amount);
          } else {
            // If disabled, send clean signal
            this.audioService.setDistortionParams(0);
          }

          // Reverb sync
          if (state.reverb.enabled) {
            this.audioService.setReverbParams(
              state.reverb.mix,
              state.reverb.decay
            );
          } else {
            // If disabled, reduce mix to 0
            this.audioService.setReverbParams(0, state.reverb.decay);
          }

          // Delay sync
          if (state.delay.enabled) {
            this.audioService.setDelayParams(
              state.delay.time,
              state.delay.feedback,
              state.delay.mix
            );
          } else {
            // If disabled, reduce mix to 0
            this.audioService.setDelayParams(state.delay.time, 0, 0);
          }
        })
      )
  );

  // --- ACTIONS (Methods called from UI or MIDI) ---

  //Distortion Actions
  public updateDistortionAmount(amount: number): void {
    this.patchState((s) => ({ distortion: { ...s.distortion, amount } }));
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
}
