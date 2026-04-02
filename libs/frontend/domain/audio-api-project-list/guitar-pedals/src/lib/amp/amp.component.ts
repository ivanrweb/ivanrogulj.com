import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuitarPedalsViewModel } from '../../viewmodel/guitar-pedals.viewmodel';

@Component({
  selector: 'lib-amp',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (vm.vm$ | async; as state) {
      <div class="amp" [class.active]="state.isRunning">
        <div class="jack-row">
          <div class="jack jack-in"></div>
          <span class="jack-label">IN</span>
        </div>
        <div class="amp-body">
          <div class="amp-label">AMP</div>
          <div class="speaker-grill">
            @for (dot of dots; track $index) {
              <div class="grill-dot"></div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .amp {
      background: linear-gradient(180deg, #1e1e1e 0%, #2a2a2a 100%);
      border: 2px solid #555;
      border-radius: 8px;
      min-width: 150px;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 6px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
      overflow: hidden;
      box-sizing: border-box;
    }
    .jack-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: #111;
      border-bottom: 1px solid #333;
    }
    .jack {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #888;
      border: 2px solid #555;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);
    }
    .jack-label {
      font-size: 0.6rem;
      color: #666;
      letter-spacing: 1px;
    }
    .amp-body {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding: 8px;
      gap: 6px;
      flex: 1;
      min-height: 0;
    }
    .amp-label {
      font-weight: bold;
      color: #aaa;
      font-size: 0.75rem;
      letter-spacing: 2px;
      text-align: center;
      flex-shrink: 0;
    }
    .speaker-grill {
      display: grid;
      grid-template-columns: repeat(6, 8px);
      grid-auto-rows: 8px;
      gap: 4px;
      align-content: space-evenly;
      justify-content: center;
      background: #111;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #333;
      flex: 1;
      min-height: 0;
    }
    .grill-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #1e1e1e;
      border: 1px solid #3a3a3a;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.9);
      transition: background 0.3s, box-shadow 0.3s, border-color 0.3s;
    }
    .amp.active .grill-dot {
      background: #ffcc00;
      border-color: #d4a000;
      box-shadow: 0 0 4px rgba(255, 204, 0, 0.5);
    }
  `]
})
export class AmpComponent {
  public readonly vm = inject(GuitarPedalsViewModel);
  public readonly dots = Array(48).fill(null);
}
