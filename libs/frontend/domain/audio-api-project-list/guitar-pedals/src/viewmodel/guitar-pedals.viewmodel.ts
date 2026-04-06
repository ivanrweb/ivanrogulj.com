import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { catchError, from, of, switchMap, tap } from 'rxjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  ChorusEffect,
  DelayEffect,
  DistortionEffect,
  ReverbEffect,
} from '@ivanrogulj.com/effects';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
import { GuitarAudioService } from '../service/guitar-audio.service';

export type PedalType = 'distortion' | 'chorus' | 'delay' | 'reverb';

export interface DistortionParams {
  amount: number;
  tone: number;
  mix: number;
  enabled: boolean;
}

export interface ChorusParams {
  rate: number;
  depth: number;
  mix: number;
  enabled: boolean;
}

export interface DelayParams {
  time: number;
  feedback: number;
  mix: number;
  enabled: boolean;
}

export interface ReverbParams {
  mix: number;
  decay: number;
  enabled: boolean;
}

export type PedalParams = {
  distortion: DistortionParams;
  chorus: ChorusParams;
  delay: DelayParams;
  reverb: ReverbParams;
};

export type LatencyMode = 'interactive' | 'balanced' | 'playback';

export interface GuitarPedalsState {
  pedalOrder: PedalType[];
  pedals: PedalParams;
  selectedInput: string | null;
  availableInputs: MediaDeviceInfo[];
  isRunning: boolean;
  inputGain: number;
  masterVolume: number;
  latencyMode: LatencyMode;
  sampleRate: number;
  latencyInfo: { baseMs: number; outputMs: number; totalMs: number } | null;
}

const defaultState: GuitarPedalsState = {
  pedalOrder: ['distortion', 'chorus', 'delay', 'reverb'],
  pedals: {
    distortion: { amount: 0.3, tone: 0.7, mix: 0.8, enabled: true },
    chorus: { rate: 0.3, depth: 0.4, mix: 0.5, enabled: false },
    delay: { time: 0.4, feedback: 0.3, mix: 0.4, enabled: false },
    reverb: { mix: 0.5, decay: 1.5, enabled: true },
  },
  selectedInput: null,
  availableInputs: [],
  isRunning: false,
  inputGain: 1.0,
  masterVolume: 1.0,
  latencyMode: 'interactive',
  sampleRate: 96000,
  latencyInfo: null,
};

@Injectable({ providedIn: 'root' })
export class GuitarPedalsViewModel extends ComponentStore<GuitarPedalsState> {
  private effectInstances: Map<PedalType, AnalogSynthApi.SynthEffect> =
    new Map();

  public readonly vm$ = this.select((s) => s);
  public readonly pedalOrder$ = this.select((s) => s.pedalOrder);
  public readonly isRunning$ = this.select((s) => s.isRunning);
  public readonly availableInputs$ = this.select((s) => s.availableInputs);

  constructor(private readonly guitarAudioService: GuitarAudioService) {
    super({
      ...defaultState,
      ...GuitarPedalsViewModel.loadAudioSettings(),
    });
  }

  private static loadAudioSettings(): Pick<
    GuitarPedalsState,
    'latencyMode' | 'sampleRate'
  > {
    try {
      const raw = localStorage.getItem('guitar-pedals-audio-settings');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return {
      latencyMode: defaultState.latencyMode,
      sampleRate: defaultState.sampleRate,
    };
  }

  private saveAudioSettings(): void {
    try {
      const { latencyMode, sampleRate } = this.get();
      localStorage.setItem(
        'guitar-pedals-audio-settings',
        JSON.stringify({ latencyMode, sampleRate })
      );
    } catch {
      // ignore
    }
  }

  public readonly loadInputs = this.effect<void>((trigger$) =>
    trigger$.pipe(
      switchMap(() =>
        from(this.guitarAudioService.getAvailableInputs()).pipe(
          tap((inputs: MediaDeviceInfo[]) =>
            this.patchState({ availableInputs: inputs })
          ),
          catchError((err: unknown) => {
            console.error('Failed to get inputs', err);
            return of([]);
          })
        )
      )
    )
  );

  public setLatencyMode(value: LatencyMode): void {
    this.patchState({ latencyMode: value });
    this.saveAudioSettings();
  }

  public setSampleRate(value: number): void {
    this.patchState({ sampleRate: value });
    this.saveAudioSettings();
  }

  public readonly start = this.effect<string | null>((deviceId$) =>
    deviceId$.pipe(
      switchMap((deviceId) => {
        const { latencyMode, sampleRate } = this.get();
        return from(
          this.guitarAudioService.initialize(
            deviceId ?? undefined,
            latencyMode,
            sampleRate
          )
        ).pipe(
          tap(() => {
            this.initEffectInstances();
            const latencyInfo = this.guitarAudioService.getLatencyInfo();
            this.patchState({ isRunning: true, latencyInfo });
            this.rewireChain();
          }),
          catchError((err: unknown) => {
            console.error('Failed to start audio', err);
            return of(undefined);
          })
        );
      })
    )
  );

  public readonly stop = this.effect<void>((trigger$) =>
    trigger$.pipe(
      switchMap(() =>
        from(this.guitarAudioService.stop()).pipe(
          tap(() => {
            this.effectInstances.clear();
            this.patchState({ isRunning: false, latencyInfo: null });
          }),
          catchError((err: unknown) => {
            console.error('Failed to stop audio', err);
            return of(undefined);
          })
        )
      )
    )
  );

  public selectInput(deviceId: string): void {
    this.patchState({ selectedInput: deviceId });
  }

  public movePedal(previousIndex: number, currentIndex: number): void {
    const order = [...this.get().pedalOrder];
    const [moved] = order.splice(previousIndex, 1);
    order.splice(currentIndex, 0, moved);
    this.patchState({ pedalOrder: order });
    this.rewireChain();
  }

  public togglePedal(type: PedalType): void {
    const pedals = { ...this.get().pedals };
    (pedals[type] as { enabled: boolean }).enabled = !(
      pedals[type] as { enabled: boolean }
    ).enabled;
    this.patchState({ pedals });
    this.rewireChain();
  }

  public updateDistortion(params: Partial<DistortionParams>): void {
    this.updatePedalParams('distortion', params);
    const effect = this.effectInstances.get('distortion');
    if (!effect) return;
    if (params.amount !== undefined) effect.setParam('amount', params.amount);
    if (params.tone !== undefined) effect.setParam('tone', params.tone);
    if (params.mix !== undefined) effect.setParam('mix', params.mix);
  }

  public updateChorus(params: Partial<ChorusParams>): void {
    this.updatePedalParams('chorus', params);
    const effect = this.effectInstances.get('chorus');
    if (!effect) return;
    if (params.rate !== undefined) effect.setParam('rate', params.rate);
    if (params.depth !== undefined) effect.setParam('depth', params.depth);
    if (params.mix !== undefined) effect.setParam('mix', params.mix);
  }

  public updateDelay(params: Partial<DelayParams>): void {
    this.updatePedalParams('delay', params);
    const effect = this.effectInstances.get('delay');
    if (!effect) return;
    if (params.time !== undefined) effect.setParam('time', params.time);
    if (params.feedback !== undefined)
      effect.setParam('feedback', params.feedback);
    if (params.mix !== undefined) effect.setParam('mix', params.mix);
  }

  public updateReverb(params: Partial<ReverbParams>): void {
    this.updatePedalParams('reverb', params);
    const effect = this.effectInstances.get('reverb');
    if (!effect) return;
    if (params.mix !== undefined) effect.setParam('mix', params.mix);
    if (params.decay !== undefined) effect.setParam('decay', params.decay);
  }

  public setInputGain(value: number): void {
    this.patchState({ inputGain: value });
    this.guitarAudioService.setInputGain(value);
  }

  public setMasterVolume(value: number): void {
    this.patchState({ masterVolume: value });
    this.guitarAudioService.setMasterVolume(value);
  }

  private initEffectInstances(): void {
    const ctx = this.guitarAudioService.getAudioContext();
    if (!ctx) return;

    this.effectInstances.clear();
    this.effectInstances.set('distortion', new DistortionEffect(ctx));
    this.effectInstances.set('chorus', new ChorusEffect(ctx));
    this.effectInstances.set('delay', new DelayEffect(ctx));
    this.effectInstances.set('reverb', new ReverbEffect(ctx));

    // Apply current state params to newly created instances
    const { pedals } = this.get();

    const dist = this.effectInstances.get('distortion')!;
    dist.setParam('amount', pedals.distortion.amount);
    dist.setParam('tone', pedals.distortion.tone);
    dist.setParam('mix', pedals.distortion.mix);

    const chorus = this.effectInstances.get('chorus')!;
    chorus.setParam('rate', pedals.chorus.rate);
    chorus.setParam('depth', pedals.chorus.depth);
    chorus.setParam('mix', pedals.chorus.mix);

    const delay = this.effectInstances.get('delay')!;
    delay.setParam('time', pedals.delay.time);
    delay.setParam('feedback', pedals.delay.feedback);
    delay.setParam('mix', pedals.delay.mix);

    const reverb = this.effectInstances.get('reverb')!;
    reverb.setParam('mix', pedals.reverb.mix);
    reverb.setParam('decay', pedals.reverb.decay);
  }

  private rewireChain(): void {
    const { pedalOrder, pedals } = this.get();
    const chain: AnalogSynthApi.SynthEffect[] = [];

    for (const type of pedalOrder) {
      if ((pedals[type] as { enabled: boolean }).enabled) {
        const effect = this.effectInstances.get(type);
        if (effect) chain.push(effect);
      }
    }

    this.guitarAudioService.setChain(chain);
  }

  private updatePedalParams<T extends PedalType>(
    type: T,
    params: Partial<PedalParams[T]>
  ): void {
    const pedals = { ...this.get().pedals };
    pedals[type] = { ...pedals[type], ...params } as PedalParams[T];
    this.patchState({ pedals });
  }
}
