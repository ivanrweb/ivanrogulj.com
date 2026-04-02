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
            [minValue]="0" [maxValue]="500" [measureUnit]="'ms'"
            [value]="state.pedals.delay.time * 1000"
            (valueChange)="vm.updateDelay({ time: $event / 1000 })"
          />
          <lib-knob
            label="Fdbk"
            [minValue]="0" [maxValue]="100" [measureUnit]="'%'"
            [value]="state.pedals.delay.feedback * 100"
            (valueChange)="vm.updateDelay({ feedback: $event / 100 })"
          />
          <lib-knob
            label="Mix"
            [minValue]="0" [maxValue]="100" [measureUnit]="'%'"
            [value]="state.pedals.delay.mix * 100"
            (valueChange)="vm.updateDelay({ mix: $event / 100 })"
          />
        </div>
        <div class="pedal-color-strip" style="background: #f39c12;"></div>
      </div>
    }
  `,
  styles: [`
    .pedal { background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%); border: 1px solid #555; border-radius: 8px; min-width: 150px; display: flex; flex-direction: column; box-shadow: 0 6px 16px rgba(0,0,0,0.5); position: relative; overflow: hidden; }
    .jack-row { display: flex; justify-content: space-between; padding: 6px 10px; background: #111; border-bottom: 1px solid #333; }
    .jack { width: 12px; height: 12px; border-radius: 50%; background: #888; border: 2px solid #555; box-shadow: inset 0 1px 3px rgba(0,0,0,0.8); }
    .pedal-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; }
    .pedal-name { font-weight: bold; color: #aaa; font-size: 0.75rem; letter-spacing: 1.5px; }
    .controls { display: flex; justify-content: center; gap: 4px; padding: 4px 8px 10px; }
    .controls.bypassed { pointer-events: none; filter: grayscale(100%); opacity: 0.5; }
    .power-btn { width: 14px; height: 14px; border-radius: 50%; border: 1px solid #777; background: #555; cursor: pointer; padding: 0; outline: none; transition: all 0.2s; }
    .power-btn.active { background: #ffcc00; box-shadow: 0 0 8px #ffcc00; border-color: #d4a000; }
    .pedal-color-strip { height: 4px; width: 100%; }
    .pedal.disabled { opacity: 0.7; }
  `]
})
export class DelayPedalComponent {
  public readonly vm = inject(GuitarPedalsViewModel);
}
