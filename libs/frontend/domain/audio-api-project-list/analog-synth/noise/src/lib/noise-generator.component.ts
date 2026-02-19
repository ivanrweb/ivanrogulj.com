import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { KnobComponent } from '@ivanrogulj.com/knob';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '@ivanrogulj.com/analog-synth';

import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

@Component({
  selector: 'lib-noise-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobComponent],
  template: `
    @if (analogSynthViewModel.vm$ | async; as vm) {
    <div class="noise-container">
      <div class="type-selector">
        <label class="label-small">COLOR</label>
        <select
          [ngModel]="vm.noiseType"
          (ngModelChange)="analogSynthViewModel.updateNoiseType($event)"
          class="synth-select"
        >
          <option value="white">White</option>
          <option value="pink">Pink</option>
          <option value="brown">Brown</option>
        </select>
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
      }

      .label-small {
        font-size: 0.6rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: bold;
      }

      .synth-select {
        background: #0a0a0a;
        color: #ffcc00;
        border: 1px solid #444;
        padding: 4px 8px;
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.75rem;
        outline: none;
        cursor: pointer;
        text-transform: uppercase;
        font-weight: bold;
        width: 80px;
      }

      .synth-select:focus {
        border-color: #ffcc00;
      }

      .knob-wrapper {
        display: flex;
        justify-content: center;
      }
    `,
  ],
})
export class NoiseGeneratorComponent {
  protected readonly AnalogSynthApi = AnalogSynthApi;
  public analogSynthViewModel = inject(AnalogSynthViewModel);
}
