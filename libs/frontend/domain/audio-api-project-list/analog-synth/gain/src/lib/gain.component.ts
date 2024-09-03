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
  styleUrl: './gain.component.css',
})
export class GainComponent {
  public gain = 0.5;
  public adsrVolumeEnvelope: ADSR = {
    attack: 0.1,
    decay: 0,
    sustain: 1,
    release: 0,
  };

  private analogSynthViewModel = inject(AnalogSynthViewModel);


  public onGainChange(): void {
    this.analogSynthViewModel.updateGain(this.gain);
  }

  public onVolumeEnvelopeChange(): void {
    this.analogSynthViewModel.updateVolumeEnvelope(this.adsrVolumeEnvelope);
  }
}
