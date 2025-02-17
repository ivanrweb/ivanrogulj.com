import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalogSynthViewModel } from '@ivanrogulj.com/analog-synth';

@Component({
  selector: 'lib-oscilloscope',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oscilloscope.component.html',
  styleUrl: './oscilloscope.component.scss',
})
export class OscilloscopeComponent implements AfterViewInit{
  @ViewChild('oscilloscope', { static: false })
  public oscilloscopeCanvas!: ElementRef<HTMLCanvasElement>;

  public analogSynthViewModel = inject(AnalogSynthViewModel);

  public ngAfterViewInit(): void {
    if (this.oscilloscopeCanvas) {
      // Initialize the oscilloscope by passing the canvas element
      this.analogSynthViewModel.initializeOscilloscope(this.oscilloscopeCanvas);
    } else {
      console.error('Oscilloscope canvas not found');
    }
  }
}
