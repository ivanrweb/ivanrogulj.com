import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { KnobComponent } from '@ivanrogulj.com/knob';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  AnalogSynthViewModel,
  EffectsViewModel,
} from '@ivanrogulj.com/analog-synth';

@Component({
  selector: 'lib-distortion',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobComponent],
  template: `
    @if (effectsVm.vm$ | async; as fxState) { @if (synthVm.vm$ | async; as
    synthState) {
    <div class="effect-unit" [class.disabled]="!fxState.distortion.enabled">
      <div class="effect-header">
        <span class="effect-title">DISTORTION</span>

        <button
          class="power-btn"
          [class.active]="fxState.distortion.enabled"
          (click)="effectsVm.toggleDistortion(!fxState.distortion.enabled)"
          title="Toggle Distortion"
        ></button>
      </div>

      <div class="effect-controls">
        <lib-knob
          label="Drive"
          [minValue]="0"
          [maxValue]="100"
          [measureUnit]="'%'"
          [value]="fxState.distortion.amount * 100"
          [isLearningMode]="synthState.learnMode"
          [isMapped]="
            synthState.mappedParams[AnalogSynthApi.Knob.DISTORTION_AMOUNT]
          "
          (valueChange)="effectsVm.updateDistortionAmount($event / 100)"
          (learn)="synthVm.startLearning(AnalogSynthApi.Knob.DISTORTION_AMOUNT)"
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
        width: 220px;
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
        gap: 2px;
      }

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
        box-shadow: 0 0 8px #ffcc00, inset 0 -1px 2px rgba(255, 255, 255, 0.4);
        border-color: #d4a000;
      }
    `,
  ],
})
export class DistortionComponent {
  public effectsVm = inject(EffectsViewModel);
  public synthVm = inject(AnalogSynthViewModel);
  protected readonly AnalogSynthApi = AnalogSynthApi;
}
