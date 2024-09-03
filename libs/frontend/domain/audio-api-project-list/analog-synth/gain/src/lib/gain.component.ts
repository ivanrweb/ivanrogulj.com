import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '../../../src/viewmodel/analog-synth.viewmodel';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-gain',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gain.component.html',
  styleUrl: './gain.component.css',
})
export class GainComponent {
  public gain = 0.5;
  private analogSynthViewModel = inject(AnalogSynthViewModel);


  public onGainChange(value: number): void {
    this.analogSynthViewModel.updateGain(value);
  }
}
