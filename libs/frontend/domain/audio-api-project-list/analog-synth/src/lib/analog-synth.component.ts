import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common'; // eslint-disable-next-line @nx/enforce-module-boundaries
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
    KeyValuePipe,
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

          <div class="midi-btn-wrapper">
            <button
              class="btn-midi"
              (click)="showMidiMapper = !showMidiMapper"
              [class.active]="showMidiMapper"
            >
              <span
                class="led"
                [class.on-yellow]="(vm.mappedParams | keyvalue).length > 0"
              ></span>
              MIDI MAP
            </button>

            @if (showMidiMapper) {
            <div class="midi-mapper-panel">
              <div class="midi-mapper-header">
                <span>MIDI MAPPINGS</span>
                <button class="close-btn" (click)="showMidiMapper = false">
                  ✕
                </button>
              </div>
              @if ((vm.mappedParams | keyvalue).length === 0) {
              <div class="no-mappings">No active mappings</div>
              } @else {
              <table class="mapper-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Control</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (entry of vm.mappedParams | keyvalue; track entry.key;
                  let i = $index) { @if (entry.value) {
                  <tr [class.even]="i % 2 === 0">
                    <td class="row-num">{{ i + 1 }}</td>
                    <td class="param-name">
                      {{ getKnobLabel(entry.key) }}
                    </td>
                    <td class="unmap-cell">
                      <button
                        class="unmap-btn"
                        (click)="
                          analogSynthViewModel.unmapParam($any(entry.key))
                        "
                      >
                        UNMAP
                      </button>
                    </td>
                  </tr>
                  } }
                </tbody>
              </table>
              }
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
          <h4 class="module-label">LFO & SEQUENCER</h4>
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
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

      :host {
        display: block;
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
        background-color: #0b0c10;
        border-radius: 10px;
        border: 1px solid #333;
        color: #c5c6c7;
        font-family: 'Inter', sans-serif;
      }

      .synth-dashboard {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .synth-header {
        background: #1f2833;
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
        font-family: 'Fira Code', monospace;
        font-weight: 700;
        letter-spacing: 2px;
        color: #66fcf1;
        font-size: 1.2rem;
        text-transform: uppercase;
      }

      .midi-btn-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .btn-midi {
        background: #0b0c10;
        border: 1px solid #333;
        color: #c5c6c7;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Fira Code', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 1px;
        transition: all 0.2s;
        height: 33px;
        box-sizing: border-box;
      }

      .btn-midi:hover {
        background: #1f2833;
        border-color: #555;
      }

      .btn-midi.active {
        background: rgba(255, 0, 127, 0.1);
        border-color: #ff007f;
        color: #ff007f;
      }

      .led {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #440000;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
      }

      .led.on {
        background: #ff007f;
        box-shadow: 0 0 6px #ff007f;
      }

      .led.on-yellow {
        background: #66fcf1;
        box-shadow: 0 0 6px #66fcf1;
      }

      .midi-mapper-panel {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        min-width: 320px;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 6px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
        z-index: 1200;
        overflow: hidden;
      }

      .midi-mapper-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #0b0c10;
        border-bottom: 1px solid #333;
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
        font-weight: 700;
        color: #888;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }

      .close-btn {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 0.85rem;
        padding: 0 4px;
        line-height: 1;
      }

      .close-btn:hover {
        color: #c5c6c7;
      }

      .no-mappings {
        padding: 16px 12px;
        font-size: 0.75rem;
        color: #555;
        text-align: center;
        font-family: 'Fira Code', monospace;
      }

      .mapper-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.75rem;
        font-family: 'Fira Code', monospace;
      }

      .mapper-table th {
        padding: 6px 12px;
        color: #888;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-align: left;
        background: #0b0c10;
        border-bottom: 1px solid #333;
      }

      .mapper-table tr {
        background: #1f2833;
      }

      .mapper-table tr.even {
        background: rgba(102, 252, 241, 0.03);
      }

      .mapper-table td {
        padding: 7px 12px;
        color: #c5c6c7;
        border-bottom: 1px solid #333;
      }

      .row-num {
        color: #555;
        width: 30px;
      }

      .unmap-cell {
        text-align: right;
      }

      .unmap-btn {
        background: #0b0c10;
        border: 1px solid rgba(255, 0, 127, 0.35);
        color: #ff007f;
        padding: 3px 8px;
        border-radius: 3px;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        transition: all 0.15s;
      }

      .unmap-btn:hover {
        background: rgba(255, 0, 127, 0.1);
        border-color: #ff007f;
      }

      .midi-tooltip {
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        width: 250px;
        background: #1f2833;
        border: 1px solid #66fcf1;
        color: #66fcf1;
        padding: 8px 12px;
        border-radius: 6px;
        font-family: 'Fira Code', monospace;
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
        background: #1f2833;
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
        font-family: 'Fira Code', monospace;
        font-size: 0.65rem;
        font-weight: 700;
        color: #888;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        width: 100%;
        text-align: center;
        background: #0b0c10;
        border-bottom: 1px solid #333;
        border-radius: 6px 6px 0 0;
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
        font-family: 'Fira Code', monospace;
        font-size: 0.6rem;
        color: #888;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
      }

      .voicing-toggle-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .voicing-text {
        font-family: 'Fira Code', monospace;
        font-size: 0.6rem;
        color: #c5c6c7;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        transform: translateY(-4px);
        width: 35px;
        display: inline-block;
        text-align: left;
      }

      .icon-lg {
        color: #c5c6c7;
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
        overflow: visible;
        position: relative;
        z-index: 10;
      }

      .lfo-module .module-content {
        overflow: visible;
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

  public showMidiMapper = false;

  protected readonly knobLabels: Record<AnalogSynthApi.Knob, string> = {
    [AnalogSynthApi.Knob.ATTACK]: 'Amp Attack',
    [AnalogSynthApi.Knob.DECAY]: 'Amp Decay',
    [AnalogSynthApi.Knob.SUSTAIN]: 'Amp Sustain',
    [AnalogSynthApi.Knob.RELEASE]: 'Amp Release',
    [AnalogSynthApi.Knob.FILTER_ATTACK]: 'Filter Attack',
    [AnalogSynthApi.Knob.FILTER_DECAY]: 'Filter Decay',
    [AnalogSynthApi.Knob.FILTER_SUSTAIN]: 'Filter Sustain',
    [AnalogSynthApi.Knob.FILTER_RELEASE]: 'Filter Release',
    [AnalogSynthApi.Knob.OSCILLATOR_COUNT]: 'Oscillator Count',
    [AnalogSynthApi.Knob.DETUNE_OSCILLATORS_AMOUNT]: 'Detune',
    [AnalogSynthApi.Knob.MASTER_GAIN]: 'Master Volume',
    [AnalogSynthApi.Knob.FILTER_FREQUENCY]: 'Filter Cutoff',
    [AnalogSynthApi.Knob.FILTER_RESONANCE]: 'Filter Resonance',
    [AnalogSynthApi.Knob.FILTER_ENVELOPE_AMOUNT]: 'Filter Env Amt',
    [AnalogSynthApi.Knob.DISTORTION_AMOUNT]: 'Distortion Amount',
    [AnalogSynthApi.Knob.DISTORTION_TONE]: 'Distortion Tone',
    [AnalogSynthApi.Knob.DISTORTION_MIX]: 'Distortion Mix',
    [AnalogSynthApi.Knob.REVERB_MIX]: 'Reverb Mix',
    [AnalogSynthApi.Knob.REVERB_DECAY]: 'Reverb Decay',
    [AnalogSynthApi.Knob.DELAY_TIME]: 'Delay Time',
    [AnalogSynthApi.Knob.DELAY_FEEDBACK]: 'Delay Feedback',
    [AnalogSynthApi.Knob.DELAY_MIX]: 'Delay Mix',
    [AnalogSynthApi.Knob.CHORUS_RATE]: 'Chorus Rate',
    [AnalogSynthApi.Knob.CHORUS_DEPTH]: 'Chorus Depth',
    [AnalogSynthApi.Knob.CHORUS_MIX]: 'Chorus Mix',
    [AnalogSynthApi.Knob.LFO1_RATE]: 'LFO 1 Rate',
    [AnalogSynthApi.Knob.LFO1_DEPTH]: 'LFO 1 Depth',
    [AnalogSynthApi.Knob.LFO2_RATE]: 'LFO 2 Rate',
    [AnalogSynthApi.Knob.LFO2_DEPTH]: 'LFO 2 Depth',
  };

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

  public getKnobLabel(key: string): string {
    return this.knobLabels[key as AnalogSynthApi.Knob] ?? key;
  }
}
