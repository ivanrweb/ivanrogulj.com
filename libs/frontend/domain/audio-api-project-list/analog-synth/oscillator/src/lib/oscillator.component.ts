import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '../../../src/viewmodel/analog-synth.viewmodel';

@Component({
  selector: 'lib-oscillator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oscillator.component.html',
  styleUrl: './oscillator.component.css',
})
export class OscillatorComponent {
  protected analogSynthViewModel = inject(AnalogSynthViewModel);

  // public createOscillator(): void {
  //   this.analogSynthViewModel.createAndStartOscillator();
  // }

  public stopOscillator(oscId: string): void {
    this.analogSynthViewModel.stopOscillator(oscId);
  }
}
