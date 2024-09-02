import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { AnalogSynthViewModel } from '../../../src/viewmodel/analog-synth.viewmodel';
import { Filter } from './filter.interface';

@Component({
  selector: 'lib-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent {
  public filterValues: { [key: string]: number } = {};
  public filters$: Observable<Filter[]>;

  private valueChangeSubject = new Subject<{ id: string, value: number }>();

  private analogSynthViewModel = inject(AnalogSynthViewModel);

  constructor() {
    this.filters$ = this.analogSynthViewModel.vm$.pipe(
      map(state => state.filters)
    );

    // Subscribe to the debounced value changes
    this.valueChangeSubject.pipe(debounceTime(50)).subscribe(({ id, value }) => {
      this.analogSynthViewModel.updateFilter(id, value);
    });
  }

  public onFilterValueChange(filterId: string): void {
    const value = this.filterValues[filterId];
    this.valueChangeSubject.next({ id: filterId, value });
  }
}
