import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '../../../src/viewmodel/analog-synth.viewmodel';
import { FormsModule } from '@angular/forms';
import { WaveformPickerComponent } from '@ivanrogulj.com/waveform-picker';

@Component({
  selector: 'lib-oscillator',
  standalone: true,
  imports: [CommonModule, FormsModule, WaveformPickerComponent],
  templateUrl: './oscillator.component.html',
  styleUrl: './oscillator.component.scss',
})
export class OscillatorComponent {
  public oscTypes = ['sine', 'triangle', 'square', 'sawtooth'];

  protected analogSynthViewModel = inject(AnalogSynthViewModel);

  // public createOscillator(): void {
  //   this.analogSynthViewModel.createAndStartOscillator();
  // }

  // public stopOscillator(oscId: string): void {
  //   this.analogSynthViewModel.stopOscillator(oscId);
  // }
  protected readonly HTMLSelectElement = HTMLSelectElement;
}
