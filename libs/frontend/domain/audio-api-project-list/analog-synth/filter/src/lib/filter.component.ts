import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { KnobComponent } from '@ivanrogulj.com/knob';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '@ivanrogulj.com/analog-synth';

@Component({
  selector: 'lib-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobComponent],
  template: ` @if (analogSynthViewModel.vm$ | async; as vm) {
    <div class="filter-controls">
      <lib-knob
        class="filter-knob"
        [minValue]="10"
        [maxValue]="10000"
        [label]="'Cutoff'"
        [value]="vm.filterFrequency"
        [measureUnit]="'Hz'"
        [isLearningMode]="vm.learnMode"
        [isMapped]="vm.mappedParams[AnalogSynthApi.Knob.FILTER_FREQUENCY]"
        (valueChange)="onFilterValueChange($event)"
        (learn)="
          analogSynthViewModel.startLearning(
            AnalogSynthApi.Knob.FILTER_FREQUENCY
          )
        "
      />

      <lib-knob
        class="filter-knob"
        [minValue]="0"
        [maxValue]="20"
        [label]="'Resonance'"
        [value]="vm.filterResonance"
        [measureUnit]="''"
        [isLearningMode]="vm.learnMode"
        [isMapped]="vm.mappedParams[AnalogSynthApi.Knob.FILTER_RESONANCE]"
        (valueChange)="onResonanceValueChange($event)"
        (learn)="
          analogSynthViewModel.startLearning(
            AnalogSynthApi.Knob.FILTER_RESONANCE
          )
        "
      />
    </div>
    }`,
  styles: [
    `
      .filter-controls {
        display: flex;
        justify-content: center;
        gap: 20px;
        width: 100%;
      }

      .filter-knob {
        flex: 1;
        min-width: 90px;
        display: flex;
        justify-content: center;
      }
    `,
  ],
})
export class FilterComponent {
  protected readonly AnalogSynthApi = AnalogSynthApi;
  protected analogSynthViewModel = inject(AnalogSynthViewModel);

  public onFilterValueChange(value$: number): void {
    this.analogSynthViewModel.updateFilterFrequency(value$);
  }

  public onResonanceValueChange(value: number): void {
    this.analogSynthViewModel.updateFilterResonance(value);
  }
}
