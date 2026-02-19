import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReverbComponent } from './reverb.component';
import { DelayComponent } from './delay.component';
import { DistortionComponent } from './distortion.component';
import { ChorusComponent } from './chorus.component';

@Component({
  selector: 'lib-effects-rack',
  standalone: true,
  imports: [
    CommonModule,
    ReverbComponent,
    DelayComponent,
    DistortionComponent,
    ChorusComponent,
  ],
  template: `
    <div class="rack-slots">
      <lib-distortion />
      <lib-chorus />
      <lib-reverb />
      <lib-delay />
    </div>
  `,
  styles: [
    `
      :host {
        width: 100%;
      }
      .rack-slots {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        justify-content: space-evenly;
        align-items: flex-start;
        width: 100%;
      }
    `,
  ],
})
export class EffectsRackComponent {}
