import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '../../../src/viewmodel/analog-synth.viewmodel';
import { KnobComponent } from '@ivanrogulj.com/knob';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

@Component({
  selector: 'lib-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobComponent],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent {
  protected analogSynthViewModel = inject(AnalogSynthViewModel);

  public onFilterValueChange(value$: number): void {
    this.analogSynthViewModel.updateFilterFrequency(value$);
  }

  protected readonly AnalogSynthApi = AnalogSynthApi;
}
