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
    <lib-knob
      [minValue]="10"
      [maxValue]="10000"
      [label]="'Cutoff'"
      [value]="vm.filterFrequency"
      [measureUnit]="'Hz'"
      [isLearningMode]="vm.learnMode"
      [isMapped]="vm.mappedParams[AnalogSynthApi.Knob.FILTER_FREQUENCY]"
      (valueChange)="onFilterValueChange($event)"
      (learn)="
        analogSynthViewModel.startLearning(AnalogSynthApi.Knob.FILTER_FREQUENCY)
      "
    >
      >
    </lib-knob>
    }`,
  styles: [``],
})
export class FilterComponent {
  protected readonly AnalogSynthApi = AnalogSynthApi;
  protected analogSynthViewModel = inject(AnalogSynthViewModel);

  public onFilterValueChange(value$: number): void {
    this.analogSynthViewModel.updateFilterFrequency(value$);
  }
}
