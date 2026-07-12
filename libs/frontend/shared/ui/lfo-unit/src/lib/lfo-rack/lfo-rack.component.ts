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
        align-items: flex-start;
        justify-content: space-evenly;
        padding: 0 20px;
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

      @media (max-width: 640px) {
        .rack-layout {
          flex-direction: column;
          min-height: 0;
        }

        .lfo-section {
          flex: 0 0 auto;
          width: 100%;
          flex-wrap: wrap;
          justify-content: center;
          gap: 15px;
          padding: 0 10px 15px;
        }

        .seq-divider {
          width: 100%;
          height: 1px;
        }

        .sequencer-section {
          flex: 0 0 auto;
          width: 100%;
          padding-left: 0;
          padding-top: 15px;
        }
      }
    `,
  ],
})
export class LfoRackComponent {}
