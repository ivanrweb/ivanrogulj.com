import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AnalogSynthViewModel } from '@ivanrogulj.com/analog-synth';

@Component({
  selector: 'lib-oscilloscope',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (analogSynthViewModel.vm$ | async; as vm) {
    <div class="scope-container">
      <canvas #oscilloscope></canvas>
    </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .scope-container {
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 0;
        box-sizing: border-box;
      }

      canvas {
        width: 100%;
        height: 200px;
        display: block;
        background-color: #000;
        border: 1px solid #333;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.1);
        border-radius: 6px;
      }
    `,
  ],
})
export class OscilloscopeComponent implements AfterViewInit {
  @ViewChild('oscilloscope', { static: false })
  public oscilloscopeCanvas!: ElementRef<HTMLCanvasElement>;

  public analogSynthViewModel = inject(AnalogSynthViewModel);

  public ngAfterViewInit(): void {
    if (this.oscilloscopeCanvas) {
      this.analogSynthViewModel.initializeOscilloscope(this.oscilloscopeCanvas);
    } else {
      setTimeout(() => {
        if (this.oscilloscopeCanvas) {
          this.analogSynthViewModel.initializeOscilloscope(
            this.oscilloscopeCanvas
          );
        }
      }, 0);
    }
  }
}
