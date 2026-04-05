import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  LfoViewModel,
  LfoState,
  AnalogSynthViewModel,
} from '@ivanrogulj.com/analog-synth';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { KnobComponent } from '@ivanrogulj.com/knob';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { WaveformPickerComponent } from '@ivanrogulj.com/waveform-picker';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { SelectComponent, SelectOption } from '@ivanrogulj.com/select';

@Component({
  selector: 'lib-lfo-unit',
  standalone: true,
  imports: [CommonModule, KnobComponent, WaveformPickerComponent, SelectComponent],
  template: `
    @if (lfoVm.vm$ | async; as vm) {
    @if (synthVm.vm$ | async; as synthState) {
    <div class="lfo-unit" [class.disabled]="!config(vm).enabled">
      <div class="lfo-header">
        <span class="lfo-title">LFO {{ lfoIndex }}</span>
        <button
          class="power-btn"
          [class.active]="config(vm).enabled"
          (click)="toggle(vm)"
        ></button>
      </div>

      <div class="lfo-controls">
        <lib-knob
          label="Rate"
          [minValue]="0.01"
          [maxValue]="20"
          [measureUnit]="'Hz'"
          [value]="config(vm).rate"
          [isLearningMode]="synthState.learnMode"
          [isMapped]="synthState.mappedParams[rateKnob]"
          (valueChange)="updateRate($event)"
          (learn)="synthVm.startLearning(rateKnob)"
        />
        <lib-knob
          label="Depth"
          [minValue]="0"
          [maxValue]="100"
          [measureUnit]="'%'"
          [value]="config(vm).depth * 100"
          [isLearningMode]="synthState.learnMode"
          [isMapped]="synthState.mappedParams[depthKnob]"
          (valueChange)="updateDepth($event / 100)"
          (learn)="synthVm.startLearning(depthKnob)"
        />
      </div>

      <lib-waveform-picker
        [waveforms]="waveforms"
        [selectedWaveform]="config(vm).waveform"
        (waveformChange)="updateWaveform($event)"
      />

      <lib-select
        [options]="destinationOptions"
        [value]="config(vm).destination"
        (valueChange)="updateDestination($event)"
      />

      <div class="lfo-footer">
        <button
          class="key-sync-btn"
          [class.active]="config(vm).keySync"
          (click)="toggleKeySync(vm)"
        >
          KEY SYNC
        </button>
      </div>
    </div>
    }}
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
      }

      .lfo-unit {
        background: #2a2a2a;
        border: 1px solid #444;
        border-radius: 6px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        color: #fff;
        transition: opacity 0.3s;
      }
      .lfo-unit.disabled {
        opacity: 0.6;
      }
      .lfo-unit.disabled .lfo-controls {
        pointer-events: none;
        filter: grayscale(100%);
      }
      .lfo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #555;
        padding-bottom: 5px;
      }
      .lfo-title {
        font-weight: bold;
        color: #888;
        font-size: 0.9rem;
        letter-spacing: 1px;
      }
      .lfo-controls {
        display: flex;
        justify-content: center;
        gap: 10px;
      }
      .lfo-footer {
        display: flex;
        justify-content: center;
      }
      .power-btn {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid #777;
        background: #555;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.8);
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        padding: 0;
        outline: none;
      }
      .power-btn:hover {
        background: #444;
      }
      .power-btn.active {
        background-color: #ffcc00;
        box-shadow: 0 0 8px #ffcc00, inset 0 -1px 2px rgba(255, 255, 255, 0.4);
        border-color: #d4a000;
      }
      .key-sync-btn {
        background: #1a1a1a;
        border: 1px solid #555;
        color: #888;
        padding: 4px 10px;
        font-size: 0.6rem;
        font-weight: bold;
        letter-spacing: 1px;
        cursor: pointer;
        border-radius: 3px;
        transition: all 0.2s;
      }
      .key-sync-btn:hover {
        border-color: #888;
        color: #ccc;
      }
      .key-sync-btn.active {
        background: rgba(255, 51, 51, 0.1);
        border-color: #ff3333;
        color: #ff3333;
        box-shadow: 0 0 6px rgba(255, 51, 51, 0.3);
      }
    `,
  ],
})
export class LfoUnitComponent {
  @Input() public lfoIndex: 1 | 2 = 1;

  protected readonly lfoVm = inject(LfoViewModel);
  protected readonly synthVm = inject(AnalogSynthViewModel);

  public readonly waveforms: OscillatorType[] = [
    'sine',
    'sawtooth',
    'square',
    'triangle',
  ];

  public readonly destinationOptions: SelectOption[] = [
    { label: 'None', value: AnalogSynthApi.LfoDestination.NONE },
    { label: 'Filter Cutoff', value: AnalogSynthApi.LfoDestination.FILTER_CUTOFF },
    { label: 'Pitch', value: AnalogSynthApi.LfoDestination.PITCH },
    { label: 'Volume', value: AnalogSynthApi.LfoDestination.VOLUME },
    { label: 'Delay Time', value: AnalogSynthApi.LfoDestination.DELAY_TIME },
  ];

  public get rateKnob(): AnalogSynthApi.Knob {
    return this.lfoIndex === 1
      ? AnalogSynthApi.Knob.LFO1_RATE
      : AnalogSynthApi.Knob.LFO2_RATE;
  }

  public get depthKnob(): AnalogSynthApi.Knob {
    return this.lfoIndex === 1
      ? AnalogSynthApi.Knob.LFO1_DEPTH
      : AnalogSynthApi.Knob.LFO2_DEPTH;
  }

  public config(vm: LfoState): AnalogSynthApi.LfoConfig {
    return this.lfoIndex === 1 ? vm.lfo1 : vm.lfo2;
  }

  public updateRate(rate: number): void {
    this.lfoIndex === 1
      ? this.lfoVm.updateLfo1({ rate })
      : this.lfoVm.updateLfo2({ rate });
  }

  public updateDepth(depth: number): void {
    this.lfoIndex === 1
      ? this.lfoVm.updateLfo1({ depth })
      : this.lfoVm.updateLfo2({ depth });
  }

  public updateWaveform(waveform: OscillatorType): void {
    this.lfoIndex === 1
      ? this.lfoVm.updateLfo1({ waveform })
      : this.lfoVm.updateLfo2({ waveform });
  }

  public updateDestination(destination: string): void {
    const dest = destination as AnalogSynthApi.LfoDestination;
    this.lfoIndex === 1
      ? this.lfoVm.updateLfo1({ destination: dest })
      : this.lfoVm.updateLfo2({ destination: dest });
  }

  public toggle(vm: LfoState): void {
    const enabled = !this.config(vm).enabled;
    this.lfoIndex === 1
      ? this.lfoVm.updateLfo1({ enabled })
      : this.lfoVm.updateLfo2({ enabled });
  }

  public toggleKeySync(vm: LfoState): void {
    const keySync = !this.config(vm).keySync;
    this.lfoIndex === 1
      ? this.lfoVm.updateLfo1({ keySync })
      : this.lfoVm.updateLfo2({ keySync });
  }
}
