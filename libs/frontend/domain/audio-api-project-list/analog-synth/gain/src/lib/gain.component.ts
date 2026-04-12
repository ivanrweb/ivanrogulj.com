import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnobComponent } from '@ivanrogulj.com/knob';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '@ivanrogulj.com/analog-synth';
import { AdsrEnvelopeComponent } from '@ivanrogulj.com/envelope';

@Component({
  selector: 'lib-gain',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobComponent, AdsrEnvelopeComponent],
  template: `
    @if (analogSynthViewModel.vm$ | async; as vm) {
    <div class="gain-panel">
      <div class="master-control">
        <lib-knob
          [minValue]="0"
          [maxValue]="1"
          [value]="vm.masterGain"
          [label]="'Master Vol'"
          [isLearningMode]="vm.learnMode"
          [isMapped]="vm.mappedParams[AnalogSynthApi.Knob.MASTER_GAIN]"
          [isPendingMapping]="vm.learnTarget === AnalogSynthApi.Knob.MASTER_GAIN"
          (valueChange)="onGainChange($event)"
          (learn)="
            analogSynthViewModel.startLearning(AnalogSynthApi.Knob.MASTER_GAIN)
          "
        >
        </lib-knob>
      </div>

      <div class="separator"></div>

      <div class="adsr-container">
        <lib-knob
          [minValue]="0"
          [maxValue]="1"
          [value]="vm.volumeEnvelope.attack"
          [label]="'Attack'"
          [isLearningMode]="vm.learnMode"
          [isMapped]="vm.mappedParams[AnalogSynthApi.Knob.ATTACK]"
          [isPendingMapping]="vm.learnTarget === AnalogSynthApi.Knob.ATTACK"
          (valueChange)="
            vm.volumeEnvelope.attack = $event;
            onVolumeEnvelopeChange(AnalogSynthApi.Knob.ATTACK, $event)
          "
          (learn)="
            analogSynthViewModel.startLearning(AnalogSynthApi.Knob.ATTACK)
          "
        >
        </lib-knob>
        <lib-knob
          [minValue]="0"
          [maxValue]="1"
          [value]="vm.volumeEnvelope.decay"
          [label]="'Decay'"
          [isLearningMode]="vm.learnMode"
          [isMapped]="vm.mappedParams[AnalogSynthApi.Knob.DECAY]"
          [isPendingMapping]="vm.learnTarget === AnalogSynthApi.Knob.DECAY"
          (valueChange)="
            vm.volumeEnvelope.decay = $event;
            onVolumeEnvelopeChange(AnalogSynthApi.Knob.DECAY, $event)
          "
          (learn)="
            analogSynthViewModel.startLearning(AnalogSynthApi.Knob.DECAY)
          "
        >
        </lib-knob>
        <lib-knob
          [minValue]="0"
          [maxValue]="1"
          [value]="vm.volumeEnvelope.sustain"
          [label]="'Sustain'"
          [isLearningMode]="vm.learnMode"
          [isMapped]="vm.mappedParams[AnalogSynthApi.Knob.SUSTAIN]"
          [isPendingMapping]="vm.learnTarget === AnalogSynthApi.Knob.SUSTAIN"
          (valueChange)="
            vm.volumeEnvelope.sustain = $event;
            onVolumeEnvelopeChange(AnalogSynthApi.Knob.SUSTAIN, $event)
          "
          (learn)="
            analogSynthViewModel.startLearning(AnalogSynthApi.Knob.SUSTAIN)
          "
        >
        </lib-knob>
        <lib-knob
          [minValue]="0"
          [maxValue]="1"
          [value]="vm.volumeEnvelope.release"
          [label]="'Release'"
          [isLearningMode]="vm.learnMode"
          [isMapped]="vm.mappedParams[AnalogSynthApi.Knob.RELEASE]"
          [isPendingMapping]="vm.learnTarget === AnalogSynthApi.Knob.RELEASE"
          (valueChange)="
            vm.volumeEnvelope.release = $event;
            onVolumeEnvelopeChange(AnalogSynthApi.Knob.RELEASE, $event)
          "
          (learn)="
            analogSynthViewModel.startLearning(AnalogSynthApi.Knob.RELEASE)
          "
        >
        </lib-knob>
      </div>

      <lib-adsr-envelope
        [attack]="vm.volumeEnvelope.attack"
        [decay]="vm.volumeEnvelope.decay"
        [sustain]="vm.volumeEnvelope.sustain"
        [release]="vm.volumeEnvelope.release"
      >
      </lib-adsr-envelope>
    </div>
    }
  `,
  styles: [
    `
      .gain-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        width: 100%;
      }
      .adsr-container {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        justify-items: center;
        width: 100%;
      }
      .separator {
        width: 80%;
        height: 1px;
        background: #333;
      }
      .master-control {
        display: flex;
        justify-content: center;
      }
    `,
  ],
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
