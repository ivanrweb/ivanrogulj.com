import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '../../../src/viewmodel/analog-synth.viewmodel';
import { FormsModule } from '@angular/forms';
import { ADSR } from './gain.interface';

@Component({
  selector: 'lib-gain',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gain.component.html',
  styleUrls: ['./gain.component.css'],
})
export class GainComponent {
  public gain = 0.2;

  protected analogSynthViewModel = inject(AnalogSynthViewModel);

  public onVolumeEnvelopeChange(param: keyof ADSR, value: number): void {
    this.analogSynthViewModel.updateVolumeEnvelope({
      [param]: value,
    });
  }

  public onGainChange(): void {
    this.analogSynthViewModel.updateGain(this.gain);
  }
}
