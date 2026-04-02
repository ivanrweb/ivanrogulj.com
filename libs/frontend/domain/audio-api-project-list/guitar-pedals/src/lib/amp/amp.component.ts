import { Component } from '@angular/core';

@Component({
  selector: 'lib-amp',
  standalone: true,
  template: `
    <div class="amp">
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
        <div class="amp-brand">OUT</div>
      </div>
    </div>
  `,
  styles: [`
    .amp {
      background: linear-gradient(180deg, #1e1e1e 0%, #2a2a2a 100%);
      border: 2px solid #555;
      border-radius: 8px;
      min-width: 120px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 6px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
      overflow: hidden;
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
      align-items: center;
      padding: 8px;
      gap: 6px;
    }
    .amp-label {
      font-weight: bold;
      color: #aaa;
      font-size: 0.7rem;
      letter-spacing: 2px;
    }
    .speaker-grill {
      display: grid;
      grid-template-columns: repeat(6, 8px);
      gap: 4px;
      background: #111;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #333;
    }
    .grill-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #2a2a2a;
      border: 1px solid #444;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.8);
    }
    .amp-brand {
      font-size: 0.6rem;
      color: #555;
      letter-spacing: 2px;
    }
  `]
})
export class AmpComponent {
  public readonly dots = Array(24).fill(null);
}
