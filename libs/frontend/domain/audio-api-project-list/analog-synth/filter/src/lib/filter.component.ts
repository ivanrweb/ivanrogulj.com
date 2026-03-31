import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnobComponent } from '@ivanrogulj.com/knob';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '@ivanrogulj.com/analog-synth';
import { AdsrEnvelopeComponent } from '@ivanrogulj.com/envelope';

@Component({
  selector: 'lib-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobComponent, AdsrEnvelopeComponent],
  template: `
    @if (analogSynthViewModel.vm$ | async; as vm) {
    <div class="filter-panel">
      <div class="top-row">
        <lib-knob
          [minValue]="10"
          [maxValue]="10000"
          [label]="'Cutoff'"
          [value]="vm.filterFrequency"
          [measureUnit]="'Hz'"
          [isLearningMode]="vm.learnMode"
          [isMapped]="vm.mappedParams[AnalogSynthApi.Knob.FILTER_FREQUENCY]"
          (valueChange)="analogSynthViewModel.updateFilterFrequency($event)"
          (learn)="
            analogSynthViewModel.startLearning(
              AnalogSynthApi.Knob.FILTER_FREQUENCY
            )
          "
        />

        <lib-knob
          [minValue]="0"
          [maxValue]="20"
          [label]="'Res'"
          [value]="vm.filterResonance"
          [measureUnit]="''"
          [isLearningMode]="vm.learnMode"
          [isMapped]="vm.mappedParams[AnalogSynthApi.Knob.FILTER_RESONANCE]"
          (valueChange)="analogSynthViewModel.updateFilterResonance($event)"
          (learn)="
            analogSynthViewModel.startLearning(
              AnalogSynthApi.Knob.FILTER_RESONANCE
            )
          "
        />

        <lib-knob
          label="Env Amt"
          [minValue]="0"
          [maxValue]="100"
          [measureUnit]="'%'"
          [value]="vm.filterEnvelopeAmount * 100"
          [isLearningMode]="vm.learnMode"
          [isMapped]="
            vm.mappedParams[AnalogSynthApi.Knob.FILTER_ENVELOPE_AMOUNT]
          "
          (learn)="
            analogSynthViewModel.startLearning(
              AnalogSynthApi.Knob.FILTER_ENVELOPE_AMOUNT
            )
          "
          (valueChange)="
            analogSynthViewModel.updateFilterEnvelopeAmount($event / 100)
          "
        ></lib-knob>
      </div>

      <div class="separator"></div>

      <div class="adsr-container">
        <lib-knob
          [minValue]="0"
          [maxValue]="1"
          [value]="vm.filterEnvelope.attack"
          [label]="'Attack'"
          [isLearningMode]="vm.learnMode"
          [isMapped]="vm.mappedParams[AnalogSynthApi.Knob.FILTER_ATTACK]"
          (valueChange)="onFilterEnvelopeChange('attack', $event)"
          (learn)="
            analogSynthViewModel.startLearning(
              AnalogSynthApi.Knob.FILTER_ATTACK
            )
          "
        />

        <lib-knob
          [minValue]="0"
          [maxValue]="1"
          [value]="vm.filterEnvelope.decay"
          [label]="'Decay'"
          [isLearningMode]="vm.learnMode"
          [isMapped]="vm.mappedParams[AnalogSynthApi.Knob.FILTER_DECAY]"
          (valueChange)="onFilterEnvelopeChange('decay', $event)"
          (learn)="
            analogSynthViewModel.startLearning(AnalogSynthApi.Knob.FILTER_DECAY)
          "
        />

        <lib-knob
          [minValue]="0"
          [maxValue]="1"
          [value]="vm.filterEnvelope.sustain"
          [label]="'Sustain'"
          [isLearningMode]="vm.learnMode"
          [isMapped]="vm.mappedParams[AnalogSynthApi.Knob.FILTER_SUSTAIN]"
          (valueChange)="onFilterEnvelopeChange('sustain', $event)"
          (learn)="
            analogSynthViewModel.startLearning(
              AnalogSynthApi.Knob.FILTER_SUSTAIN
            )
          "
        />

        <lib-knob
          [minValue]="0"
          [maxValue]="1"
          [value]="vm.filterEnvelope.release"
          [label]="'Release'"
          [isLearningMode]="vm.learnMode"
          [isMapped]="vm.mappedParams[AnalogSynthApi.Knob.FILTER_RELEASE]"
          (valueChange)="onFilterEnvelopeChange('release', $event)"
          (learn)="
            analogSynthViewModel.startLearning(
              AnalogSynthApi.Knob.FILTER_RELEASE
            )
          "
        />
      </div>

      <lib-adsr-envelope
        [attack]="vm.filterEnvelope.attack"
        [decay]="vm.filterEnvelope.decay"
        [sustain]="vm.filterEnvelope.sustain"
        [release]="vm.filterEnvelope.release"
      >
      </lib-adsr-envelope>
    </div>
    }
  `,
  styles: [
    `
      .filter-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        width: 100%;
      }

      .top-row {
        display: flex;
        justify-content: center;
        gap: 15px;
        width: 100%;
      }

      .adsr-container {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        justify-items: center;
        width: 100%;
      }

      .separator {
        width: 80%;
        height: 1px;
        background: #333;
      }

      :host ::ng-deep .value-display {
        white-space: nowrap !important;
      }
    `,
  ],
})
export class FilterComponent {
  protected readonly AnalogSynthApi = AnalogSynthApi;
  protected analogSynthViewModel = inject(AnalogSynthViewModel);

  public onFilterEnvelopeChange(
    param: keyof AnalogSynthApi.ADSR,
    value: number
  ): void {
    this.analogSynthViewModel.updateFilterEnvelope({
      [param]: value,
    });
  }
}
