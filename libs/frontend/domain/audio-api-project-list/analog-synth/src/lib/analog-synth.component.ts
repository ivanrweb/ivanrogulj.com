import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { OscillatorComponent } from '@ivanrogulj.com/oscillator';
import { AudioContextService } from '../service/audio-context.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { FilterComponent } from '@ivanrogulj.com/filter';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { GainComponent } from '@ivanrogulj.com/gain';
import { AnalogSynthViewModel } from '../viewmodel/analog-synth.viewmodel';
@Component({
  selector: 'lib-analog-synth',
  standalone: true,
  imports: [CommonModule, OscillatorComponent, FilterComponent, GainComponent],
  providers: [AudioContextService],
  templateUrl: './analog-synth.component.html',
  styleUrl: './analog-synth.component.css',
})
export class AnalogSynthComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('oscilloscope', { static: false })
  public oscilloscopeCanvas!: ElementRef<HTMLCanvasElement>;

  private analogSynthViewModel = inject(AnalogSynthViewModel);

  public ngOnInit(): void {
    this.analogSynthViewModel.startAudioContext();
  }

  public ngAfterViewInit(): void {
    if (this.oscilloscopeCanvas) {
      // Initialize the oscilloscope by passing the canvas element
      this.analogSynthViewModel.initializeOscilloscope(this.oscilloscopeCanvas);
    } else {
      console.error('Oscilloscope canvas not found');
    }
  }

  public ngOnDestroy(): void {
    this.analogSynthViewModel.destroyAudioContext();
  }

}

