import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { KnobComponent } from '@ivanrogulj.com/knob';
import { EffectsViewModel } from '../../../../../../domain/audio-api-project-list/analog-synth/src/viewmodel/effects.viewmodel;

@Component({
  selector: 'lib-reverb',
  standalone: true,
  imports: [CommonModule, KnobComponent],
  template: `
    @if (reverbState$ | async; as state) {
    <div class="effect-module">
      <div class="header">
        <span class="led" [class.on]="state.enabled"></span>
        <h4>Reverb</h4>
      </div>

      <div class="controls">
        <lib-knob
          label="Mix"
          [value]="state.mix * 100"
          [maxValue]="100"
          measureUnit="%"
          (valueChange)="effectsVm.updateReverbMix($event / 100)"
        ></lib-knob>

        <lib-knob
          label="Size"
          [value]="state.decay"
          [minValue]="0.1"
          [maxValue]="5.0"
          measureUnit="s"
          (valueChange)="effectsVm.updateReverbDecay($event)"
        ></lib-knob>
      </div>
    </div>
    }
  `,
  styles: [
    `
      .effect-module {
        border: 1px solid #555;
        background: #2a2a2a;
        border-radius: 4px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 140px;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid #444;
        padding-bottom: 5px;
        margin-bottom: 5px;
      }
      h4 {
        margin: 0;
        font-size: 0.9rem;
        text-transform: uppercase;
        color: #ccc;
      }
      .controls {
        display: flex;
        justify-content: center;
        gap: 10px;
      }
      .led {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #330000;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
      }
      .led.on {
        background: #ff3333;
        box-shadow: 0 0 5px #ff3333, inset 0 1px 2px rgba(255, 255, 255, 0.5);
      }
    `,
  ],
})
export class ReverbComponent {
  protected effectsVm = inject(EffectsViewModel);
  protected reverbState$ = this.effectsVm.select((state) => state.reverb);
}
