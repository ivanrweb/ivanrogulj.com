import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { KnobComponent } from '@ivanrogulj.com/knob';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '@ivanrogulj.com/analog-synth';

import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
import { SelectComponent, SelectOption } from '@ivanrogulj.com/select';

@Component({
  selector: 'lib-noise-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobComponent, SelectComponent],
  template: `
    @if (analogSynthViewModel.vm$ | async; as vm) {
    <div class="noise-container">
      <div class="type-selector">
        <label class="label-small">COLOR</label>
        <lib-select
          [options]="noiseOptions"
          [value]="vm.noiseType"
          (valueChange)="analogSynthViewModel.updateNoiseType($any($event))"
        ></lib-select>
      </div>

      <div class="knob-wrapper">
        <lib-knob
          [minValue]="0"
          [maxValue]="1"
          [label]="'Noise Lvl'"
          [value]="vm.noiseVolume"
          [measureUnit]="''"
          [isLearningMode]="vm.learnMode"
          [isMapped]="false"
          (valueChange)="analogSynthViewModel.updateNoiseVolume($event)"
        />
      </div>
    </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .noise-container {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        width: 100%;
        height: 100%;
      }

      .type-selector {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        width: 80px;
      }

      .label-small {
        font-size: 0.6rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: bold;
      }

      .knob-wrapper {
        display: flex;
        justify-content: center;
      }
    `,
  ],
})
export class NoiseGeneratorComponent {
  public analogSynthViewModel = inject(AnalogSynthViewModel);

  public noiseOptions: SelectOption[] = [
    { label: 'White', value: 'white' },
    { label: 'Pink', value: 'pink' },
    { label: 'Brown', value: 'brown' },
  ];

  protected readonly AnalogSynthApi = AnalogSynthApi;
}
