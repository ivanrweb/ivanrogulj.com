import { inject, Injectable } from '@angular/core';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { LfoEngine } from '@ivanrogulj.com/effects';
import { AudioContextService } from './audio-context.service';

@Injectable({ providedIn: 'root' })
export class LfoService {
  private readonly audioContextService = inject(AudioContextService);
  private engines: [LfoEngine | null, LfoEngine | null] = [null, null];
  private readonly configs: [AnalogSynthApi.LfoConfig, AnalogSynthApi.LfoConfig] =
    [defaultLfoConfig(), defaultLfoConfig()];
  private activeVoices: AnalogSynthApi.Voice[] = [];

  private readonly DEPTH_SCALES: Record<AnalogSynthApi.LfoDestination, number> = {
    [AnalogSynthApi.LfoDestination.NONE]: 0,
    [AnalogSynthApi.LfoDestination.FILTER_CUTOFF]: 4000,
    [AnalogSynthApi.LfoDestination.PITCH]: 100,
    [AnalogSynthApi.LfoDestination.VOLUME]: 0.3,
    [AnalogSynthApi.LfoDestination.DELAY_TIME]: 0.02,
  };

  public initialize(): void {
    const context = this.audioContextService.getAudioContext();
    this.engines[0] = new LfoEngine(context);
    this.engines[1] = new LfoEngine(context);
  }

  public applyConfig(index: 0 | 1, config: AnalogSynthApi.LfoConfig): void {
    if (!this.engines[index]) {
      return;
    }
    const engine = this.engines[index]!;
    this.configs[index] = config;

    engine.setRate(config.rate);
    engine.setWaveform(config.waveform);

    const scale = this.DEPTH_SCALES[config.destination];
    engine.setDepth(config.enabled ? config.depth : 0, scale);

    engine.disconnectAll();
    if (config.enabled && config.destination !== AnalogSynthApi.LfoDestination.NONE) {
      this.routeToDestination(engine, config);
    }
  }

  private routeToDestination(
    engine: LfoEngine,
    config: AnalogSynthApi.LfoConfig
  ): void {
    if (config.destination === AnalogSynthApi.LfoDestination.FILTER_CUTOFF) {
      this.activeVoices.forEach((v) =>
        engine.connectParam(v.filterNode.frequency)
      );
    } else if (config.destination === AnalogSynthApi.LfoDestination.PITCH) {
      this.activeVoices.forEach((v) =>
        v.oscNodes.forEach((osc) => engine.connectParam(osc.detune))
      );
    } else if (config.destination === AnalogSynthApi.LfoDestination.VOLUME) {
      const masterGain = this.audioContextService.getMasterGain();
      if (masterGain) {
        engine.connectParam(masterGain.gain);
      }
    } else if (config.destination === AnalogSynthApi.LfoDestination.DELAY_TIME) {
      const delayNode = this.audioContextService.getDelayNode();
      if (delayNode) {
        engine.connectParam(delayNode.delayTime);
      }
    }
  }

  public connectToVoice(voice: AnalogSynthApi.Voice): void {
    this.activeVoices.push(voice);
    this.engines.forEach((engine, i) => {
      if (!engine) return;
      const config = this.configs[i as 0 | 1];
      if (!config.enabled) return;
      if (config.destination === AnalogSynthApi.LfoDestination.FILTER_CUTOFF) {
        engine.connectParam(voice.filterNode.frequency);
      } else if (config.destination === AnalogSynthApi.LfoDestination.PITCH) {
        voice.oscNodes.forEach((osc) => engine.connectParam(osc.detune));
      }
    });
  }

  public disconnectFromVoice(voice: AnalogSynthApi.Voice): void {
    this.activeVoices = this.activeVoices.filter((v) => v.id !== voice.id);
    this.engines.forEach((engine, i) => {
      if (!engine) return;
      const config = this.configs[i as 0 | 1];
      if (config.enabled && config.destination !== AnalogSynthApi.LfoDestination.NONE) {
        engine.disconnectAll();
        this.routeToDestination(engine, config);
      }
    });
  }

  public keySync(index: 0 | 1): void {
    this.engines[index]?.keySync();
  }
}

function defaultLfoConfig(): AnalogSynthApi.LfoConfig {
  return {
    rate: 2,
    depth: 0,
    waveform: 'sine',
    destination: AnalogSynthApi.LfoDestination.NONE,
    keySync: false,
    enabled: false,
  };
}
