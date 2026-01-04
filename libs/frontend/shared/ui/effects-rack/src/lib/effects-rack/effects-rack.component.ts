import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReverbComponent } from './reverb.component';

@Component({
  selector: 'lib-effects-rack',
  standalone: true,
  imports: [CommonModule, ReverbComponent],
  template: `
    <div class="rack-container">
      <h4 class="rack-label">FX RACK</h4>
      <div class="rack-slots">
        <lib-reverb></lib-reverb>
      </div>
    </div>
  `,
  styles: [
    `
      .rack-container {
        margin-top: 20px;
        background-color: #1a1a1a;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #333;
      }

      .rack-label {
        margin: 0 0 10px 0;
        color: #666;
        font-size: 0.8rem;
        text-transform: uppercase;
      }

      .rack-slots {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        align-items: flex-start;
      }
    `,
  ],
})
export class EffectsRackComponent {}
