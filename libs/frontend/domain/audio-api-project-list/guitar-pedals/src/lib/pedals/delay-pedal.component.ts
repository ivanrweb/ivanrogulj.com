import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnobComponent } from '@ivanrogulj.com/knob';
import { GuitarPedalsViewModel } from '../../viewmodel/guitar-pedals.viewmodel';

@Component({
  selector: 'lib-delay-pedal',
  standalone: true,
  imports: [CommonModule, KnobComponent],
  template: `
    @if (vm.vm$ | async; as state) {
    <div class="pedal" [class.disabled]="!state.pedals.delay.enabled">
      <div class="jack-row">
        <div class="jack jack-in"></div>
        <div class="jack jack-out"></div>
      </div>
      <div class="pedal-header">
        <span class="pedal-name">DELAY</span>
        <button
          class="power-btn"
          [class.active]="state.pedals.delay.enabled"
          (click)="vm.togglePedal('delay')"
        ></button>
      </div>
      <div class="controls" [class.bypassed]="!state.pedals.delay.enabled">
        <lib-knob
          label="Time"
          [minValue]="0"
          [maxValue]="500"
          [measureUnit]="'ms'"
          [value]="state.pedals.delay.time * 1000"
          (valueChange)="vm.updateDelay({ time: $event / 1000 })"
        />
        <lib-knob
          label="Fdbk"
          [minValue]="0"
          [maxValue]="100"
          [measureUnit]="'%'"
          [value]="state.pedals.delay.feedback * 100"
          (valueChange)="vm.updateDelay({ feedback: $event / 100 })"
        />
        <lib-knob
          label="Mix"
          [minValue]="0"
          [maxValue]="100"
          [measureUnit]="'%'"
          [value]="state.pedals.delay.mix * 100"
          (valueChange)="vm.updateDelay({ mix: $event / 100 })"
        />
      </div>
      <div class="pedal-color-strip" style="background: #f39c12;"></div>
    </div>
    }
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap');
      .pedal {
        background: linear-gradient(180deg, #162030 0%, #1f2833 100%);
        border: 1px solid #2a3a4a;
        border-radius: 8px;
        min-width: 150px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.03);
        position: relative;
        overflow: hidden;
      }
      .jack-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 10px;
        background: #0b0c10;
        border-bottom: 1px solid #2a3a4a;
      }
      .jack {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #666;
        border: 2px solid #444;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.8);
      }
      .pedal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 10px;
      }
      .pedal-name {
        font-family: 'Fira Code', monospace;
        font-weight: bold;
        color: #66fcf1;
        font-size: 0.72rem;
        letter-spacing: 1.5px;
      }
      .controls {
        display: flex;
        justify-content: center;
        gap: 4px;
        padding: 4px 8px 10px;
      }
      .controls.bypassed {
        pointer-events: none;
        filter: grayscale(100%);
        opacity: 0.4;
      }
      .power-btn {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 1px solid #444;
        background: #333;
        cursor: pointer;
        padding: 0;
        outline: none;
        transition: all 0.2s;
      }
      .power-btn.active {
        background: #66fcf1;
        box-shadow: 0 0 8px rgba(102, 252, 241, 0.6);
        border-color: #45a29e;
      }
      .pedal-color-strip {
        height: 4px;
        width: 100%;
      }
      .pedal.disabled {
        opacity: 0.6;
      }
    `,
  ],
})
export class DelayPedalComponent {
  public readonly vm = inject(GuitarPedalsViewModel);
}
