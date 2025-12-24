import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnobComponent } from '@ivanrogulj.com/knob';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '@ivanrogulj.com/analog-synth';

@Component({
  selector: 'lib-gain',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobComponent],
  templateUrl: './gain.component.html',
  styleUrls: ['./gain.component.scss'],
})
export class GainComponent {
  protected analogSynthViewModel = inject(AnalogSynthViewModel);

  public onVolumeEnvelopeChange(
    param: keyof AnalogSynthApi.ADSR,
    value: number
  ): void {
    this.analogSynthViewModel.updateVolumeEnvelope({
      [param]: value,
    });
  }

  public onGainChange(value$: number): void {
    this.analogSynthViewModel.updateGain(value$);
  }

  protected readonly AnalogSynthApi = AnalogSynthApi;
}
