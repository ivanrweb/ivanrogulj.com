import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnobComponent } from '@ivanrogulj.com/knob';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  AnalogSynthViewModel,
  EffectsViewModel,
} from '@ivanrogulj.com/analog-synth';

@Component({
  selector: 'lib-reverb',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobComponent],
  template: `
    @if (effectsVm.vm$ | async; as fxState) { @if (synthVm.vm$ | async; as
    synthState) {
    <div class="effect-unit" [class.disabled]="!fxState.reverb.enabled">
      <div class="effect-header">
        <span class="effect-title">REVERB</span>

        <button
          class="power-btn"
          [class.active]="fxState.reverb.enabled"
          (click)="effectsVm.toggleReverb(!fxState.reverb.enabled)"
          title="Toggle Reverb"
        ></button>
      </div>

      <div class="effect-controls">
        <lib-knob
          label="Mix"
          [minValue]="0"
          [maxValue]="100"
          [measureUnit]="'%'"
          [value]="fxState.reverb.mix * 100"
          [isLearningMode]="synthState.learnMode"
          [isMapped]="synthState.mappedParams[AnalogSynthApi.Knob.REVERB_MIX]"
          (valueChange)="effectsVm.updateReverbMix($event / 100)"
          (learn)="synthVm.startLearning(AnalogSynthApi.Knob.REVERB_MIX)"
        ></lib-knob>

        <lib-knob
          label="Decay"
          [minValue]="0.1"
          [maxValue]="10.0"
          [measureUnit]="'s'"
          [value]="fxState.reverb.decay"
          [isLearningMode]="synthState.learnMode"
          [isMapped]="synthState.mappedParams[AnalogSynthApi.Knob.REVERB_DECAY]"
          (valueChange)="effectsVm.updateReverbDecay($event)"
          (learn)="synthVm.startLearning(AnalogSynthApi.Knob.REVERB_DECAY)"
        ></lib-knob>
      </div>
    </div>
    } }
  `,
  styles: [
    `
      .effect-unit {
        background: #2a2a2a;
        border: 1px solid #444;
        border-radius: 6px;
        width: auto;
        display: flex;
        flex-direction: column;
        padding: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        transition: opacity 0.3s;
        color: #ffffff;

        &.disabled {
          opacity: 0.8;
          .effect-controls {
            pointer-events: none;
            filter: grayscale(100%);
          }
        }
      }

      .effect-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        border-bottom: 2px solid #555;
        padding-bottom: 5px;
      }

      .effect-title {
        font-weight: bold;
        color: #888;
        font-size: 0.9rem;
        letter-spacing: 1px;
      }

      .effect-controls {
        display: flex;
        justify-content: center;
        gap: 10px;
      }

      /* LED Power Button */
      .power-btn {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid #777;
        background: #555;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.8);
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        padding: 0;
        outline: none;
      }

      .power-btn:hover {
        background: #444;
      }

      .power-btn.active {
        background-color: #ffcc00;
        box-shadow: 0 0 8px #ffcc00, inset 0 -1px 2px rgba(255, 255, 255, 0.4); /* Glow + Highlight */
        border-color: #d4a000;
      }
    `,
  ],
})
export class ReverbComponent {
  public effectsVm = inject(EffectsViewModel);
  public synthVm = inject(AnalogSynthViewModel);
  protected readonly AnalogSynthApi = AnalogSynthApi;
}
