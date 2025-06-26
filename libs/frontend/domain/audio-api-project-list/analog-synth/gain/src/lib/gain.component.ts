import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '../../../src/viewmodel/analog-synth.viewmodel';
import { FormsModule } from '@angular/forms';
import { ADSR } from './gain.interface';
import { KnobComponent } from '@ivanrogulj.com/knob';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

@Component({
  selector: 'lib-gain',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobComponent],
  templateUrl: './gain.component.html',
  styleUrls: ['./gain.component.scss'],
})
export class GainComponent {
  protected analogSynthViewModel = inject(AnalogSynthViewModel);

  public onVolumeEnvelopeChange(param: keyof ADSR, value: number): void {
    this.analogSynthViewModel.updateVolumeEnvelope({
      [param]: value,
    });
  }

  public onGainChange(value$: number): void {
    this.analogSynthViewModel.updateGain(value$);
  }

  protected readonly AnalogSynthApi = AnalogSynthApi;
}
