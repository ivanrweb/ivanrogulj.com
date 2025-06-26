import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { OscillatorComponent } from '@ivanrogulj.com/oscillator';
import { AudioContextService } from '../service/audio-context.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { FilterComponent } from '@ivanrogulj.com/filter';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { GainComponent } from '@ivanrogulj.com/gain';
import { AnalogSynthViewModel } from '../viewmodel/analog-synth.viewmodel';
import { FormsModule } from '@angular/forms';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { OscilloscopeComponent } from '@ivanrogulj.com/oscilloscope';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { TextareaComponent } from '@ivanrogulj.com/textarea';

@Component({
  selector: 'lib-analog-synth',
  standalone: true,
  imports: [CommonModule, OscillatorComponent, FilterComponent, GainComponent, FormsModule, OscilloscopeComponent, TextareaComponent],
  providers: [AudioContextService],
  templateUrl: './analog-synth.component.html',
  styleUrl: './analog-synth.component.scss',
})
export class AnalogSynthComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('oscilloscope', { static: false })
  public oscilloscopeCanvas!: ElementRef<HTMLCanvasElement>;

  public analogSynthViewModel = inject(AnalogSynthViewModel);

  public ngOnInit(): void {
    this.analogSynthViewModel.startAudioContext();
  }

  public ngAfterViewInit(): void {
    if (this.oscilloscopeCanvas) {
      this.analogSynthViewModel.initializeOscilloscope(this.oscilloscopeCanvas);
    } else {
      console.error('Oscilloscope canvas not found');
    }
  }

  public ngOnDestroy(): void {
    this.analogSynthViewModel.destroyAudioContext();
  }
}
