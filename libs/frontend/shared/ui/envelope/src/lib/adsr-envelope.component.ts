import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-adsr-envelope',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="visualizer-container">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none">
        <path [attr.d]="pathData()" class="envelope-path" />
      </svg>
    </div>
  `,
  styles: [
    `
      .visualizer-container {
        width: 100%;
        height: 60px;
        background: #0a0a0a;
        border: 1px solid #333;
        border-radius: 4px;
        margin-top: 10px;
        padding: 5px;
        box-sizing: border-box;
      }

      svg {
        width: 100%;
        height: 100%;
        display: block;
      }

      .envelope-path {
        fill: none;
        stroke: #ff3333;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    `,
  ],
})
export class AdsrEnvelopeComponent {
  public attack = input<number>(0);
  public decay = input<number>(0);
  public sustain = input<number>(0);
  public release = input<number>(0);

  public pathData = computed(() => {
    const a = this.attack();
    const d = this.decay();
    const s = this.sustain();
    const r = this.release();

    const width = 100;
    const height = 40;
    const padding = 2;
    const effectiveHeight = height - padding * 2;

    const aWidth = a * 25;
    const dWidth = d * 25;
    const rWidth = r * 25;
    const sLevel = effectiveHeight - s * effectiveHeight + padding;

    return `
      M 0,${height - padding}
      L ${aWidth},${padding}
      L ${aWidth + dWidth},${sLevel}
      L ${width - rWidth},${sLevel}
      L ${width},${height - padding}
    `;
  });
}
