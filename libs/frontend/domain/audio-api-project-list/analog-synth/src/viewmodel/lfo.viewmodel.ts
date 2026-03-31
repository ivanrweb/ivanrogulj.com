import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { distinctUntilChanged, Observable, tap } from 'rxjs';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
import { LfoService } from '../service/lfo.service';

export interface LfoState {
  lfo1: AnalogSynthApi.LfoConfig;
  lfo2: AnalogSynthApi.LfoConfig;
}

const DEFAULT_LFO: AnalogSynthApi.LfoConfig = {
  rate: 2,
  depth: 0,
  waveform: 'sine',
  destination: AnalogSynthApi.LfoDestination.NONE,
  keySync: false,
  enabled: false,
};

@Injectable({ providedIn: 'root' })
export class LfoViewModel extends ComponentStore<LfoState> {
  public readonly vm$: Observable<LfoState> = this.select((s) => s);
  private readonly lfoService = inject(LfoService);

  constructor() {
    super({ lfo1: { ...DEFAULT_LFO }, lfo2: { ...DEFAULT_LFO } });

    this.syncLfo(this.select((s) => s.lfo1), 0);
    this.syncLfo(this.select((s) => s.lfo2), 1);
  }

  private syncLfo(
    config$: Observable<AnalogSynthApi.LfoConfig>,
    index: 0 | 1
  ): void {
    this.effect((c$: Observable<AnalogSynthApi.LfoConfig>) =>
      c$.pipe(
        distinctUntilChanged(
          (a, b) => JSON.stringify(a) === JSON.stringify(b)
        ),
        tap((config) => this.lfoService.applyConfig(index, config))
      )
    )(config$);
  }

  public updateLfo1(partial: Partial<AnalogSynthApi.LfoConfig>): void {
    this.patchState((s) => ({ lfo1: { ...s.lfo1, ...partial } }));
  }

  public updateLfo2(partial: Partial<AnalogSynthApi.LfoConfig>): void {
    this.patchState((s) => ({ lfo2: { ...s.lfo2, ...partial } }));
  }

  public getState(): LfoState {
    return this.get();
  }
}
