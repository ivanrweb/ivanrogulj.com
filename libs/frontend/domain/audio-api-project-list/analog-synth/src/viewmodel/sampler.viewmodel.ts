import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, tap } from 'rxjs';
import { v7 as uuidv7 } from 'uuid';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
import { SamplerService } from '../service/sampler.service';
import { AudioContextService } from '../service/audio-context.service';

export interface SamplerState {
  selectedPreset: string | null;
  loading: boolean;
  loaded: boolean;
}

@Injectable({ providedIn: 'root' })
export class SamplerViewModel extends ComponentStore<SamplerState> {
  private readonly samplerService = inject(SamplerService);
  private readonly audioContextService = inject(AudioContextService);

  public readonly selectedPreset$ = this.select((s) => s.selectedPreset);
  public readonly loading$ = this.select((s) => s.loading);
  public readonly loaded$ = this.select((s) => s.loaded);

  constructor() {
    super({ selectedPreset: null, loading: false, loaded: false });
  }

  public readonly selectPreset = this.effect(
    (presetId$: Observable<string>) =>
      presetId$.pipe(
        tap((presetId) => {
          this.patchState({ selectedPreset: presetId, loading: true, loaded: false });
          this.samplerService
            .loadPreset(presetId, this.audioContextService.getAudioContext())
            .subscribe({
              next: () => this.patchState({ loading: false, loaded: true }),
              error: () => this.patchState({ loading: false, loaded: false }),
            });
        })
      )
  );

  public createBufferSourceNode(
    note: number,
    filterNode: BiquadFilterNode
  ): AudioBufferSourceNode | null {
    const { selectedPreset } = this.get();
    if (!selectedPreset) return null;

    const result = this.samplerService.getNearestBuffer(selectedPreset, note);
    if (!result) return null;

    const ctx = this.audioContextService.getAudioContext();
    const sourceNode = new AudioBufferSourceNode(ctx, { buffer: result.buffer });
    // Transpose to the requested note if we're using a nearby sample
    if (result.semitoneOffset !== 0) {
      sourceNode.playbackRate.value = Math.pow(2, result.semitoneOffset / 12);
    }
    sourceNode.connect(filterNode);
    return sourceNode;
  }

  public buildSamplerVoice(
    note: number,
    velocity: number,
    filterNode: BiquadFilterNode,
    adsrGainNode: GainNode,
    levelGainNode: GainNode
  ): AnalogSynthApi.Voice | null {
    const sourceNode = this.createBufferSourceNode(note, filterNode);
    if (!sourceNode) return null;

    const voice: AnalogSynthApi.Voice = {
      id: uuidv7(),
      note,
      velocity,
      oscNodes: [],
      sourceNode,
      filterNode,
      adsrGainNode,
      levelGainNode,
    };

    sourceNode.start();
    return voice;
  }

  public releaseSamplerVoice(voice: AnalogSynthApi.Voice, releaseTime: number): void {
    if (!voice.sourceNode) return;
    const stopAt = this.audioContextService.currentTime + releaseTime + 0.05;
    try {
      voice.sourceNode.stop(stopAt);
    } catch {
      // already stopped
    }
  }

  public getState(): SamplerState {
    return this.get();
  }
}
