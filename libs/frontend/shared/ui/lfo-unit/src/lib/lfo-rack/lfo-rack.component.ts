import { Component } from '@angular/core';
import { LfoUnitComponent } from '../lfo-unit/lfo-unit.component';
import { SequencerComponent } from '../sequencer/sequencer.component';

@Component({
  selector: 'lib-lfo-rack',
  standalone: true,
  imports: [LfoUnitComponent, SequencerComponent],
  template: `
    <div class="rack-layout">
      <div class="lfo-section">
        <lib-lfo-unit [lfoIndex]="1" />
        <lib-lfo-unit [lfoIndex]="2" />
      </div>
      <div class="seq-divider"></div>
      <div class="sequencer-section">
        <lib-sequencer />
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .rack-layout {
        display: flex;
        width: 100%;
        gap: 0;
        align-items: stretch;
        min-height: 220px;
      }

      .lfo-section {
        flex: 0 0 50%;
        display: flex;
        flex-wrap: nowrap;
        gap: 10px;
        align-items: flex-start;
        justify-content: flex-start;
        padding-right: 20px;
        box-sizing: border-box;
        overflow: visible;
      }

      .lfo-section lib-lfo-unit {
        flex: 0 0 auto;
      }

      .seq-divider {
        width: 1px;
        background: #333;
        flex-shrink: 0;
        align-self: stretch;
      }

      .sequencer-section {
        flex: 0 0 50%;
        padding-left: 20px;
        box-sizing: border-box;
        display: flex;
        align-items: flex-start;
      }

      .sequencer-section lib-sequencer {
        width: 100%;
      }
    `,
  ],
})
export class LfoRackComponent {}
