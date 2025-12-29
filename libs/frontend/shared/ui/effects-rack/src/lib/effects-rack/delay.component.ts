import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnobComponent } from '@ivanrogulj.com/knob';

@Component({
  selector: 'lib-delay',
  standalone: true,
  imports: [CommonModule, KnobComponent],
  template: `
    @if (delayState$ | async; as state) {
    <div class="effect-module">
      <div class="header">
        <span class="led" [class.on]="state.enabled"></span>
        <h4>Delay</h4>
      </div>

      <div class="controls">
        <lib-knob
          label="Time"
          [value]="state.time"
          [minValue]="0"
          [maxValue]="1.0"
          measureUnit="s"
          (valueChange)="effectsVm.updateDelayTime($event)"
        ></lib-knob>

        <lib-knob
          label="Fdbk"
          [value]="state.feedback * 100"
          [maxValue]="90"
          measureUnit="%"
          (valueChange)="effectsVm.updateDelayFeedback($event / 100)"
        ></lib-knob>

        <lib-knob
          label="Mix"
          [value]="state.mix * 100"
          [maxValue]="100"
          measureUnit="%"
          (valueChange)="effectsVm.updateDelayMix($event / 100)"
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
        min-width: 200px;
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
      }
      .led.on {
        background: #00ff00;
        box-shadow: 0 0 5px #00ff00;
      }
    `,
  ],
})
export class DelayComponent {
  protected effectsVm = inject(EffectsViewModel);
  protected delayState$ = this.effectsVm.select((state) => state.delay);
}
