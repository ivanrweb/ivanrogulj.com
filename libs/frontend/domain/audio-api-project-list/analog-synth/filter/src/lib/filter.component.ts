import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Filter } from './filter.interface'; // Adjust the path if needed
import { AnalogSynthViewModel } from '../../../src/viewmodel/analog-synth.viewmodel';

@Component({
  selector: 'lib-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent implements OnInit {
  public filters$: Observable<Filter[]>;
  public filterValues: { [id: string]: number } = {};

  private analogSynthViewModel = inject(AnalogSynthViewModel);

  constructor() {
    this.filters$ = this.analogSynthViewModel.vm$.pipe(
      map(state => state.filters)
    );
  }

  public ngOnInit(): void {
    this.filters$.subscribe(filters => {
      // Initialize filter values
      filters.forEach(filter => {
        this.filterValues[filter.id] = filter.frequency;
      });
    }).unsubscribe(); // Unsubscribe immediately after subscription to avoid memory leaks
  }

  public onFilterValueChange(filterId: string): void {
    const newValue = this.filterValues[filterId];
    this.analogSynthViewModel.updateFilter(filterId, newValue);
  }
}
