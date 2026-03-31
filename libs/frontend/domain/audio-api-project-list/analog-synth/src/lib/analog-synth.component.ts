import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { OscillatorComponent } from '@ivanrogulj.com/oscillator';
import { AudioContextService } from '../service/audio-context.service'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { FilterComponent } from '@ivanrogulj.com/filter'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { GainComponent } from '@ivanrogulj.com/gain';
import { AnalogSynthViewModel } from '../viewmodel/analog-synth.viewmodel';
import { FormsModule } from '@angular/forms'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { OscilloscopeComponent } from '@ivanrogulj.com/oscilloscope'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { TextareaComponent } from '@ivanrogulj.com/textarea';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { EffectsRackComponent } from '@ivanrogulj.com/effects-rack'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { NoiseGeneratorComponent } from '@ivanrogulj.com/noise'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { LfoRackComponent } from '@ivanrogulj.com/lfo-unit';

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
    EffectsRackComponent,
    NoiseGeneratorComponent,
    LfoRackComponent,
  ],
  providers: [AudioContextService],
  template: `
    @if (analogSynthViewModel.vm$ | async; as vm) {
    <div class="synth-dashboard">
      <div class="synth-header">
        <div class="header-left">
          <h3 class="synth-title">ANALOG SYNTH</h3>
        </div>

        <div class="header-right">
          <div class="midi-btn-wrapper">
            <button
              class="btn-midi"
              (click)="analogSynthViewModel.toggleMidiLearn()"
              [class.active]="vm.learnMode"
            >
              <span class="led" [class.on]="vm.learnMode"></span>
              {{ 'MIDI LEARN' }}
            </button>

            @if (vm.learnMode) {
            <div class="midi-tooltip">
              Double click on UI knob/button with mouse first, then assign the
              physical knob on your MIDI interface to it by rotating/pressing
              it.
            </div>
            }
          </div>

          <lib-textarea />
        </div>
      </div>

      <div class="module-grid">
        <div class="synth-module source-module">
          <h4 class="module-label">OSCILLATOR</h4>
          <div class="module-content">
            <lib-oscillator />
          </div>
        </div>

        <div class="synth-module utility-module">
          <h4 class="module-label">UTILITY</h4>

          <div class="module-content utility-content">
            <div class="utility-controls">
              <div class="control-group">
                <label class="control-label">VOICING</label>
                <div class="voicing-toggle-wrapper">
                  <i
                    class="icon-lg"
                    [class.icon-fad-squareswitch-on]="vm.isPolyphonic"
                    [class.icon-fad-squareswitch-off]="!vm.isPolyphonic"
                    (click)="analogSynthViewModel.togglePolyphony()"
                  ></i>
                  <span class="voicing-text">{{
                    vm.isPolyphonic ? 'POLY' : 'MONO'
                  }}</span>
                </div>
              </div>

              <lib-noise-generator />
            </div>

            <div class="utility-scope">
              <lib-oscilloscope />
            </div>
          </div>
        </div>

        <div class="synth-module filter-module">
          <h4 class="module-label">FILTER</h4>
          <div class="module-content">
            <lib-filter />
          </div>
        </div>

        <div class="synth-module amp-module">
          <h4 class="module-label">AMPLIFIER</h4>
          <div class="module-content">
            <lib-gain />
          </div>
        </div>

        <div class="synth-module lfo-module">
          <h4 class="module-label">LFO</h4>
          <div class="module-content">
            <lib-lfo-rack />
          </div>
        </div>

        <div class="synth-module fx-module">
          <h4 class="module-label">EFFECTS RACK</h4>
          <div class="module-content">
            <lib-effects-rack />
          </div>
        </div>
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
        z-index: 1000;
      }

      .header-left,
      .header-right {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .synth-title {
        margin: 0;
        font-weight: 900;
        letter-spacing: 2px;
        color: #888;
        font-size: 1.2rem;
        text-transform: uppercase;
      }

      .midi-btn-wrapper {
        position: relative;
        display: flex;
        align-items: center;
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
        height: 33px;
        box-sizing: border-box;
      }

      .btn-midi:hover {
        background: #333;
      }

      .btn-midi.active {
        border-color: #ff3333;
        color: #fff;
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

      .midi-tooltip {
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        width: 250px;
        background: #1a1a1a;
        border: 1px solid #ffcc00;
        color: #ffcc00;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.75rem;
        text-align: left;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
        z-index: 1100;
        pointer-events: none;
        animation: fadeIn 0.2s ease-out;
      }

      .module-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
      }

      .synth-module {
        background: #1e1e1e;
        border: 1px solid #333;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: visible;
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

      .utility-content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
        width: 100%;
        height: 100%;
        padding: 15px;
        box-sizing: border-box;
      }

      .utility-controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        gap: 20px;
      }

      .utility-scope {
        width: 100%;
        height: 60px;
        background: #000;
        border: 1px solid #333;
        border-radius: 4px;
        overflow: hidden;
        display: flex;
      }

      .utility-scope ::ng-deep canvas {
        width: 100% !important;
        height: 100% !important;
      }

      .control-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }

      .control-label {
        font-size: 0.6rem;
        color: #888;
        font-weight: bold;
        letter-spacing: 1px;
        text-transform: uppercase;
      }

      .voicing-toggle-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .voicing-text {
        font-size: 0.6rem;
        color: #d0d0d0;
        font-weight: normal;
        letter-spacing: 1px;
        text-transform: uppercase;
        transform: translateY(-4px);
        width: 35px;
        display: inline-block;
        text-align: left;
      }

      .icon-lg {
        color: #d0d0d0;
        font-size: 2.4rem;
        cursor: pointer;
        display: inline-block;
        margin-top: -15px;
        margin-bottom: -15px;
        transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .fx-module {
        grid-column: 1 / -1;
      }

      .lfo-module {
        grid-column: 1 / -1;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class AnalogSynthComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('oscilloscope', { static: false })
  public oscilloscopeCanvas!: ElementRef<HTMLCanvasElement>;

  public analogSynthViewModel = inject(AnalogSynthViewModel);

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
