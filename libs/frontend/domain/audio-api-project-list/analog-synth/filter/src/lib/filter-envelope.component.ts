import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnobComponent } from '@ivanrogulj.com/knob';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '@ivanrogulj.com/analog-synth';

@Component({
  selector: 'lib-filter-envelope',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobComponent],
  template: `@if (analogSynthViewModel.vm$ | async; as vm) {
    <div class="env-panel">
      <div class="amount-control">
        <lib-knob
          label="ENV Amount"
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
          (valueChange)="
            vm.filterEnvelope.attack = $event;
            onFilterEnvelopeChange('attack', $event)
          "
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
          (valueChange)="
            vm.filterEnvelope.decay = $event;
            onFilterEnvelopeChange('decay', $event)
          "
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
          (valueChange)="
            vm.filterEnvelope.sustain = $event;
            onFilterEnvelopeChange('sustain', $event)
          "
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
          (valueChange)="
            vm.filterEnvelope.release = $event;
            onFilterEnvelopeChange('release', $event)
          "
          (learn)="
            analogSynthViewModel.startLearning(
              AnalogSynthApi.Knob.FILTER_RELEASE
            )
          "
        />
      </div>
    </div>
    }`,
  styles: [
    `
      .env-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        width: 100%;
      }
      .amount-control {
        display: flex;
        justify-content: center;
      }
      .adsr-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }
      .separator {
        width: 80%;
        height: 1px;
        background: #333;
      }
      .knob-group {
        flex: 1;
        text-align: center;
        border: 1px solid red;
      }
    `,
  ],
})
export class FilterEnvelopeComponent {
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
