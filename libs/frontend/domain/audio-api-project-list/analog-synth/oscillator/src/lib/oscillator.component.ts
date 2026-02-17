import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '@ivanrogulj.com/analog-synth';
import { FormsModule } from '@angular/forms';
import { WaveformPickerComponent } from '@ivanrogulj.com/waveform-picker';
import { CountSelectorComponent } from '@ivanrogulj.com/count-selector';
import { KnobComponent } from '@ivanrogulj.com/knob';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

@Component({
  selector: 'lib-oscillator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WaveformPickerComponent,
    CountSelectorComponent,
    KnobComponent,
  ],
  template: `
    @if (analogSynthViewModel.vm$ | async; as vm) {
    <div class="osc-container">
      <div class="row">
        <lib-waveform-picker
          [waveforms]="oscTypes"
          [selectedWaveform]="vm.selectedOscType"
          (waveformChange)="analogSynthViewModel.onOscillatorTypeChange($event)"
        >
        </lib-waveform-picker>
      </div>

      <div class="row">
        <lib-count-selector
          label="OSC COUNT"
          [value]="vm.oscillatorCount"
          [min]="1"
          [max]="8"
          (valueChange)="analogSynthViewModel.updateOscillatorCount($event)"
        >
        </lib-count-selector>
      </div>

      <div
        class="row spread-row"
        [style.visibility]="vm.oscillatorCount > 1 ? 'visible' : 'hidden'"
      >
        <lib-knob
          label="Spread"
          [minValue]="0"
          [maxValue]="100"
          [measureUnit]="'%'"
          [value]="vm.detuneOscillatorsAmount"
          [isLearningMode]="vm.learnMode"
          [isMapped]="
            vm.mappedParams[AnalogSynthApi.Knob.DETUNE_OSCILLATORS_AMOUNT]
          "
          (learn)="
            analogSynthViewModel.startLearning(
              AnalogSynthApi.Knob.DETUNE_OSCILLATORS_AMOUNT
            )
          "
          (valueChange)="
            analogSynthViewModel.updateDetuneOscillatorsAmount($event)
          "
        ></lib-knob>
      </div>
    </div>
    }
  `,
  styles: [
    `
      .osc-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        gap: 15px;
      }

      .row {
        display: flex;
        justify-content: center;
        width: 100%;
      }

      .spread-row {
        min-height: 80px;
        align-items: flex-start;
      }
    `,
  ],
})
export class OscillatorComponent {
  public oscTypes: OscillatorType[] = [
    'sine',
    'triangle',
    'square',
    'sawtooth',
  ];

  protected readonly AnalogSynthApi = AnalogSynthApi;
  protected analogSynthViewModel = inject(AnalogSynthViewModel);

  // public createOscillator(): void {
  //   this.analogSynthViewModel.createAndStartOscillator();
  // }

  // public stopOscillator(oscId: string): void {
  //   this.analogSynthViewModel.stopOscillator(oscId);
  // }
}
