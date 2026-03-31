import { Component } from '@angular/core';
import { LfoUnitComponent } from '../lfo-unit/lfo-unit.component';

@Component({
  selector: 'lib-lfo-rack',
  standalone: true,
  imports: [LfoUnitComponent],
  template: `
    <div class="lfo-rack">
      <lib-lfo-unit [lfoIndex]="1" />
      <lib-lfo-unit [lfoIndex]="2" />
    </div>
  `,
  styles: [
    `
      .lfo-rack {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
      }
    `,
  ],
})
export class LfoRackComponent {}
