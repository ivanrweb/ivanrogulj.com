import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AudioContextService } from '@ivanrogulj.com/analog-synth';

@Component({
  selector: 'lib-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css',
})
export class FilterComponent {

  public filter1?: BiquadFilterNode;
  public filterValue = 1000;

  private audioContextService = inject(AudioContextService);

  public createFilter(): void {
    this.filter1 = this.audioContextService.setFilter(this.filterValue);
  }
}
