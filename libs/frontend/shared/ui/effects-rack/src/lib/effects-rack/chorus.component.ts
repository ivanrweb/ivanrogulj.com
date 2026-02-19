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
  selector: 'lib-chorus',
  standalone: true,
  imports: [CommonModule, FormsModule, KnobComponent],
  template: `
    @if (effectsVm.vm$ | async; as fxState) { @if (synthVm.vm$ | async; as
    synthState) {
    <div class="effect-unit" [class.disabled]="!fxState.chorus.enabled">
      <div class="effect-header">
        <span class="effect-title">CHORUS</span>

        <button
          class="power-btn"
          [class.active]="fxState.chorus.enabled"
          (click)="effectsVm.toggleChorus(!fxState.chorus.enabled)"
          title="Toggle Chorus"
        ></button>
      </div>

      <div class="effect-controls">
        <lib-knob
          label="Rate"
          [minValue]="0"
          [maxValue]="100"
          [measureUnit]="'%'"
          [value]="fxState.chorus.rate * 100"
          [isLearningMode]="synthState.learnMode"
          [isMapped]="synthState.mappedParams[AnalogSynthApi.Knob.CHORUS_RATE]"
          (valueChange)="effectsVm.updateChorusRate($event / 100)"
          (learn)="synthVm.startLearning(AnalogSynthApi.Knob.CHORUS_RATE)"
        ></lib-knob>

        <lib-knob
          label="Depth"
          [minValue]="0"
          [maxValue]="100"
          [measureUnit]="'%'"
          [value]="fxState.chorus.depth * 100"
          [isLearningMode]="synthState.learnMode"
          [isMapped]="synthState.mappedParams[AnalogSynthApi.Knob.CHORUS_DEPTH]"
          (valueChange)="effectsVm.updateChorusDepth($event / 100)"
          (learn)="synthVm.startLearning(AnalogSynthApi.Knob.CHORUS_DEPTH)"
        ></lib-knob>

        <lib-knob
          label="Mix"
          [minValue]="0"
          [maxValue]="100"
          [measureUnit]="'%'"
          [value]="fxState.chorus.mix * 100"
          [isLearningMode]="synthState.learnMode"
          [isMapped]="synthState.mappedParams[AnalogSynthApi.Knob.CHORUS_MIX]"
          (valueChange)="effectsVm.updateChorusMix($event / 100)"
          (learn)="synthVm.startLearning(AnalogSynthApi.Knob.CHORUS_MIX)"
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
      }

      .effect-unit.disabled {
        opacity: 0.8;
      }

      .effect-unit.disabled .effect-controls {
        pointer-events: none;
        filter: grayscale(100%);
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
        justify-content: space-around;
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
export class ChorusComponent {
  public effectsVm = inject(EffectsViewModel);
  public synthVm = inject(AnalogSynthViewModel);
  protected readonly AnalogSynthApi = AnalogSynthApi;
}
