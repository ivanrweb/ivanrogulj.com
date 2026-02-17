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
    <div class="synth-dashboard">
      <div class="synth-header">
        <div class="header-left">
          <h3 class="synth-title">ANALOG SYNTH</h3>

          <button
            class="btn-midi"
            (click)="analogSynthViewModel.toggleMidiLearn()"
            [class.active]="vm.learnMode"
          >
            <span class="led" [class.on]="vm.learnMode"></span>
            {{ vm.learnMode ? 'MIDI LEARN ON' : 'MIDI LEARN' }}
          </button>

          <div class="ai-header-wrapper">
            <lib-textarea />
          </div>
        </div>

        <div class="header-right">
          <div>
            <lib-count-selector
              label="OSCILLATORS"
              [value]="vm.oscillatorCount"
              [min]="1"
              [max]="8"
              (valueChange)="analogSynthViewModel.updateOscillatorCount($event)"
            >
            </lib-count-selector>
          </div>

          @if (vm.oscillatorCount > 1) {
          <div class="osc-detune-amount">
            <lib-knob
              label="Spread"
              [minValue]="0"
              [maxValue]="100"
              [measureUnit]="'%'"
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
          </div>
          }
        </div>

        @if (vm.learnMode) {
        <div class="midi-hint">
          Double click on button with mouse first, then assign the physical knob
          to it by pressing/rotating it
        </div>
        }
      </div>

      <div class="module-grid">
        <div class="synth-module source-module">
          <h4 class="module-label">SOURCE</h4>
          <div class="module-content">
            <lib-oscillator />
          </div>
        </div>

        <div class="synth-module filter-module">
          <h4 class="module-label">FILTER</h4>
          <div class="module-content">
            <lib-filter />
          </div>
        </div>

        <div class="synth-module env-module">
          <h4 class="module-label">FILTER ENV</h4>
          <div class="module-content">
            <lib-filter-envelope />
          </div>
        </div>

        <div class="synth-module amp-module">
          <h4 class="module-label">AMPLIFIER</h4>
          <div class="module-content">
            <lib-gain />
          </div>
        </div>

        <div class="synth-module fx-module">
          <h4 class="module-label">EFFECTS RACK</h4>
          <div class="module-content">
            <lib-effects-rack />
          </div>
        </div>
      </div>

      <div class="visuals-section">
        <lib-oscilloscope />
      </div>
    </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
        background-color: #121212;
        border-radius: 10px;
        border: 1px solid #333;
        color: #e0e0e0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .synth-dashboard {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      /* HEADER */
      .synth-header {
        background: #1a1a1a;
        padding: 15px 20px;
        border-radius: 8px;
        border: 1px solid #333;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        position: relative;
      }

      .header-left,
      .header-right {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .synth-title {
        margin: 0;
        font-weight: 900;
        letter-spacing: 2px;
        color: #888;
        font-size: 1.2rem;
        text-transform: uppercase;
      }

      .btn-midi {
        background: #2a2a2a;
        border: 1px solid #444;
        color: #ccc;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        font-weight: bold;
        transition: all 0.2s;
      }

      .btn-midi:hover {
        background: #333;
      }
      .btn-midi.active {
        border-color: #ff0000;
        color: #fff;
      }

      .ai-header-wrapper {
        display: flex;
        align-items: center;
      }

      .led {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #440000;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
      }
      .led.on {
        background: #ff0000;
        box-shadow: 0 0 6px #ff0000;
      }

      .osc-detune-amount {
        transform: scale(0.9);
      }

      .midi-hint {
        width: 100%;
        font-size: 0.8rem;
        color: #ffcc00;
        text-align: center;
        padding-top: 5px;
        border-top: 1px solid #333;
        margin-top: 10px;
      }

      /* GRID SYSTEM */
      .module-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
      }

      /* MODULE CARD */
      .synth-module {
        background: #1e1e1e;
        border: 1px solid #333;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      .module-label {
        margin: 0;
        padding: 8px 0;
        font-size: 0.7rem;
        font-weight: bold;
        color: #888;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        width: 100%;
        text-align: center;
        background: #252525;
        border-bottom: 1px solid #333;
      }

      .module-content {
        padding: 15px;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .fx-module {
        grid-column: 1 / -1;
      }

      /* VISUALS */
      .visuals-section {
        width: 100%;
        background: #000;
        border-radius: 8px;
        border: 1px solid #333;
        padding: 0;
        overflow: hidden;
      }
    `,
  ],
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
    }
  }

  public ngOnDestroy(): void {
    this.analogSynthViewModel.destroyAudioContext();
  }

  protected readonly AnalogSynthApi = AnalogSynthApi;
}
