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
        <label class="toggle-switch">
          <input
            type="checkbox"
            [ngModel]="fxState.delay.enabled"
            (ngModelChange)="effectsVm.toggleDelay($event)"
          />
          <span class="slider"></span>
        </label>
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
          opacity: 0.6;
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
        color: #ddd;
        font-size: 0.9rem;
        letter-spacing: 1px;
      }

      .effect-controls {
        display: flex;
        justify-content: space-around;
        gap: 2px;
      }

      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 30px;
        height: 16px;
      }
      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #555;
        transition: 0.4s;
        border-radius: 16px;
      }
      .slider:before {
        position: absolute;
        content: '';
        height: 10px;
        width: 10px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
      }
      input:checked + .slider {
        background-color: #4caf50;
      }
      input:checked + .slider:before {
        transform: translateX(14px);
      }
    `,
  ],
})
export class DelayComponent {
  public effectsVm = inject(EffectsViewModel);
  public synthVm = inject(AnalogSynthViewModel);
  protected readonly AnalogSynthApi = AnalogSynthApi;
}
