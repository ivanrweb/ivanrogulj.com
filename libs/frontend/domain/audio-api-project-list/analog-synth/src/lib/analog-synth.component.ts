import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { OscillatorComponent } from '@ivanrogulj.com/oscillator';
import { AudioContextService } from '../service/audio-context.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  FilterComponent,
  FilterEnvelopeComponent,
} from '@ivanrogulj.com/filter';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { GainComponent } from '@ivanrogulj.com/gain';
import { AnalogSynthViewModel } from '../viewmodel/analog-synth.viewmodel';
import { FormsModule } from '@angular/forms';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { OscilloscopeComponent } from '@ivanrogulj.com/oscilloscope';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { TextareaComponent } from '@ivanrogulj.com/textarea';
import { KnobComponent } from '@ivanrogulj.com/knob';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { EffectsRackComponent } from '@ivanrogulj.com/effects-rack';
import { CountSelectorComponent } from '@ivanrogulj.com/count-selector';

@Component({
  selector: 'lib-analog-synth',
  standalone: true,
  imports: [
    CommonModule,
    OscillatorComponent,
    FilterComponent,
    GainComponent,
    FormsModule,
    OscilloscopeComponent,
    TextareaComponent,
    FilterEnvelopeComponent,
    KnobComponent,
    EffectsRackComponent,
    CountSelectorComponent,
  ],
  providers: [AudioContextService],
  template: `
    @if (analogSynthViewModel.vm$ | async; as vm) {
    <div>
      <h3>Analog Synth</h3>

      <!-- Global MIDI Learn toggle -->
      <button (click)="analogSynthViewModel.toggleMidiLearn()">
        {{ vm.learnMode ? 'MIDI Learn ON' : 'MIDI Learn OFF' }}
      </button>

      <div>
        <lib-count-selector
          [value]="vm.oscillatorCount"
          [min]="1"
          [max]="4"
          (valueChange)="analogSynthViewModel.updateOscillatorCount($event)"
        >
        </lib-count-selector>
      </div>

      <div class="osc-detune-amount">
        @if (vm.oscillatorCount > 1) {
        <lib-knob
          label="Spread (detune oscillators)"
          [minValue]="0"
          [maxValue]="100"
          [measureUnit]="'ct'"
          [value]="vm.detuneOscillatorsAmount"
          [isLearningMode]="vm.learnMode"
          [isMapped]="
            vm.mappedParams[AnalogSynthApi.Knob.DETUNE_OSCILLATORS_AMOUNT]
          "
          (learn)="
            analogSynthViewModel.startLearning(
              AnalogSynthApi.Knob.DETUNE_OSCILLATORS_AMOUNT
            )
          "
          (valueChange)="
            analogSynthViewModel.updateDetuneOscillatorsAmount($event)
          "
        ></lib-knob>
        }
      </div>

      @if (vm.learnMode) {
      <p>
        Double click on button with mouse first, then assign the physical knob
        to it by pressing/rotating it
      </p>
      }

      <lib-oscillator />
      <lib-filter />
      <lib-gain />
      <lib-filter-envelope />
      <lib-effects-rack />
      <lib-oscilloscope />
      <lib-textarea />
    </div>
    }
  `,
  styles: [``],
})
export class AnalogSynthComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('oscilloscope', { static: false })
  public oscilloscopeCanvas!: ElementRef<HTMLCanvasElement>;

  public analogSynthViewModel = inject(AnalogSynthViewModel);

  //User can select from 1 to 8 oscillators
  public readonly oscillatorCount = [1, 2, 3, 4, 5, 6, 7, 8];

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

  protected readonly AnalogSynthApi = AnalogSynthApi;
}
