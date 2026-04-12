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
  selector: 'lib-delay',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobComponent],
  template: `
    @if (effectsVm.vm$ | async; as fxState) { @if (synthVm.vm$ | async; as
    synthState) {
    <div class="effect-unit" [class.disabled]="!fxState.delay.enabled">
      <div class="effect-header">
        <span class="effect-title">DELAY</span>

        <button
          class="power-btn"
          [class.active]="fxState.delay.enabled"
          (click)="effectsVm.toggleDelay(!fxState.delay.enabled)"
          title="Toggle Delay"
        ></button>
      </div>

      <div class="effect-controls">
        <lib-knob
          label="Time"
          [minValue]="0"
          [maxValue]="1.0"
          [measureUnit]="'s'"
          [value]="fxState.delay.time"
          [isLearningMode]="synthState.learnMode"
          [isMapped]="synthState.mappedParams[AnalogSynthApi.Knob.DELAY_TIME]"
          [isPendingMapping]="synthState.learnTarget === AnalogSynthApi.Knob.DELAY_TIME"
          (valueChange)="effectsVm.updateDelayTime($event)"
          (learn)="synthVm.startLearning(AnalogSynthApi.Knob.DELAY_TIME)"
        ></lib-knob>

        <lib-knob
          label="Feedback"
          [minValue]="0"
          [maxValue]="100"
          [measureUnit]="'%'"
          [value]="fxState.delay.feedback * 100"
          [isLearningMode]="synthState.learnMode"
          [isMapped]="
            synthState.mappedParams[AnalogSynthApi.Knob.DELAY_FEEDBACK]
          "
          [isPendingMapping]="synthState.learnTarget === AnalogSynthApi.Knob.DELAY_FEEDBACK"
          (valueChange)="effectsVm.updateDelayFeedback($event / 100)"
          (learn)="synthVm.startLearning(AnalogSynthApi.Knob.DELAY_FEEDBACK)"
        ></lib-knob>

        <lib-knob
          label="Mix"
          [minValue]="0"
          [maxValue]="100"
          [measureUnit]="'%'"
          [value]="fxState.delay.mix * 100"
          [isLearningMode]="synthState.learnMode"
          [isMapped]="synthState.mappedParams[AnalogSynthApi.Knob.DELAY_MIX]"
          [isPendingMapping]="synthState.learnTarget === AnalogSynthApi.Knob.DELAY_MIX"
          (valueChange)="effectsVm.updateDelayMix($event / 100)"
          (learn)="synthVm.startLearning(AnalogSynthApi.Knob.DELAY_MIX)"
        ></lib-knob>
      </div>
    </div>
    } }
  `,
  styles: [
    `
      .effect-unit {
        background: #0d1117;
        border: 1px solid #2a3545;
        border-radius: 6px;
        width: auto;
        display: flex;
        flex-direction: column;
        padding: 10px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.7), 0 2px 4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
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
        border-bottom: 1px solid #2a3545;
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
export class DelayComponent {
  public effectsVm = inject(EffectsViewModel);
  public synthVm = inject(AnalogSynthViewModel);
  protected readonly AnalogSynthApi = AnalogSynthApi;
}
