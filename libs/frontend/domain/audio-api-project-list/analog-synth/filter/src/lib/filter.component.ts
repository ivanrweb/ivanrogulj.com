import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { Filter } from '@ivanrogulj.com/filter';
import { AnalogSynthViewModel } from '../../../src/viewmodel/analog-synth.viewmodel';

@Component({
  selector: 'lib-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent {
  public filterValue = 1000;

  private viewModel = inject(AnalogSynthViewModel);


  public filters$: Observable<Filter[]> = this.viewModel.vm$.pipe(
    map(state => state.filters)
  );

  public updateFilter(filterId: string): void {
    this.viewModel.updateFilter(filterId, this.filterValue);
  }
}
