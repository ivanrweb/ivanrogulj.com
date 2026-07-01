import {
  afterNextRender,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnobComponent } from '@ivanrogulj.com/knob';
import { SelectComponent, SelectOption } from '@ivanrogulj.com/select'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { ButtonDirective } from '@ivanrogulj.com/button'; // eslint-disable-next-line @nx/enforce-module-boundaries
import { TourComponent, TourStep } from '@ivanrogulj.com/tour';
import { GuitarPedalsViewModel } from '../viewmodel/guitar-pedals.viewmodel';
import { PedalboardComponent } from './pedalboard/pedalboard.component';
import { AudioSettingsComponent } from './audio-settings/audio-settings.component';

const TOUR_STORAGE_KEY = 'guitar-pedals-tour';

const GUITAR_PEDALS_TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '.controls-bar',
    title: 'Connect Your Guitar',
    content: [
      'Select your audio input device (e.g. your Focusrite interface or built-in mic), then click ▶ Start.',
      'Your browser will ask for microphone permission — this is required to capture the guitar signal.',
    ],
    tooltipPosition: 'bottom',
  },
  {
    targetSelector: '.board',
    title: 'The Pedalboard',
    content: [
      'Effects run live in chain.',
      'Drag any pedal left or right to reorder it.',
    ],
    tooltipPosition: 'top',
  },
  {
    targetSelector: '.pedal-slot',
    title: 'Each Pedal',
    content: [
      'Click the LED dot at the top right of any pedal to bypass or re-enable that effect.',
      'Use the knobs to introduce Drive, Tone, Mix and other parameters.',
    ],
    tooltipPosition: 'top',
  },
  {
    targetSelector: '.gain-controls',
    title: 'Input & Master',
    content: [
      'Input controls how loud the guitar signal enters the chain — useful if your interface has no hardware gain knob.',
      'Master sets the final output volume going to your speakers.',
    ],
    tooltipPosition: 'bottom',
  },
];

@Component({
  selector: 'lib-guitar-pedals',
  standalone: true,
  imports: [
    CommonModule,
    KnobComponent,
    SelectComponent,
    PedalboardComponent,
    AudioSettingsComponent,
    ButtonDirective,
    TourComponent,
  ],
  template: `
    @if (vm.vm$ | async; as state) {
    <div class="header">
      <div class="title-row">
        <h2 class="title">Guitar Pedalboard</h2>
        <p class="subtitle">Real-time guitar effects via Web Audio API</p>
      </div>

      <div class="controls-bar">
        <div class="control-group">
          <span class="control-label">Audio Input</span>
          <lib-select
            [options]="inputOptions()"
            [value]="state.selectedInput ?? ''"
            (valueChange)="vm.selectInput($event)"
          />
        </div>

        <lib-audio-settings />

        <button libBtn (click)="startTour()">APP TOUR</button>

        <button
          class="start-btn"
          [class.running]="state.isRunning"
          (click)="state.isRunning ? vm.stop() : vm.start(state.selectedInput)"
        >
          {{ state.isRunning ? '■ Stop' : '▶ Start' }}
        </button>

        <div class="gain-controls" [class.inactive]="!state.isRunning">
          <lib-knob
            label="Input"
            [minValue]="0"
            [maxValue]="200"
            [measureUnit]="'%'"
            [value]="state.inputGain * 100"
            (valueChange)="vm.setInputGain($event / 100)"
          />
          <lib-knob
            label="Master"
            [minValue]="0"
            [maxValue]="100"
            [measureUnit]="'%'"
            [value]="state.masterVolume * 100"
            (valueChange)="vm.setMasterVolume($event / 100)"
          />
        </div>
      </div>
    </div>

    <div class="board-section">
      <lib-pedalboard />
    </div>

    @if (showHint()) {
    <div class="drag-hint">
      <span class="hint-icon">💡</span>
      <span class="hint-text"
        >Drag pedals to reorder &nbsp;•&nbsp; Click LED dot to turn the effect
        On/Off</span
      >
      <button class="hint-close" (click)="showHint.set(false)" title="Dismiss">
        ✕
      </button>
    </div>
    } }

    <lib-tour [steps]="tourSteps" storageKey="guitar-pedals-tour" />
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
        color: #c5c6c7;
        font-family: 'Inter', sans-serif;
      }

      .header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 15px 20px;
        margin-bottom: 20px;
      }

      .title-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .title {
        margin: 0;
        font-weight: 900;
        letter-spacing: 2px;
        color: #66fcf1;
        font-size: 1.2rem;
        text-transform: uppercase;
        font-family: 'Fira Code', monospace;
      }

      .subtitle {
        margin: 0;
        color: #888;
        font-size: 0.8rem;
      }

      .controls-bar {
        display: flex;
        align-items: flex-end;
        gap: 16px;
        flex-wrap: wrap;
      }

      .control-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 180px;
      }

      .control-label {
        font-size: 0.65rem;
        color: #888;
        letter-spacing: 1px;
        text-transform: uppercase;
        font-weight: bold;
        font-family: 'Fira Code', monospace;
      }

      .start-btn {
        padding: 6px 18px;
        border-radius: 4px;
        border: 1px solid #333;
        background: #1f2833;
        color: #c5c6c7;
        font-size: 0.8rem;
        font-family: 'Fira Code', monospace;
        cursor: pointer;
        letter-spacing: 1px;
        text-transform: uppercase;
        font-weight: bold;
        transition: all 0.2s;
      }

      .start-btn:hover {
        border-color: #66fcf1;
        color: #66fcf1;
      }

      .start-btn.running {
        background: rgba(255, 0, 127, 0.1);
        border-color: #ff007f;
        color: #ff007f;
      }

      .start-btn.running:hover {
        background: rgba(255, 0, 127, 0.2);
      }

      .gain-controls {
        display: flex;
        gap: 8px;
        align-items: center;
        transition: opacity 0.3s;
      }

      .gain-controls.inactive {
        opacity: 0.3;
        pointer-events: none;
      }

      .board-section {
        position: relative;
      }

      .board-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 12px;
        color: #666;
        font-size: 0.85rem;
        letter-spacing: 1px;
        text-transform: uppercase;
        cursor: default;
        pointer-events: all;
      }

      .drag-hint {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 10px;
        padding: 8px 14px;
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 6px;
        color: #888;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
        font-family: 'Fira Code', monospace;
      }

      .hint-icon {
        font-size: 0.85rem;
      }

      .hint-text {
        flex: 1;
        text-align: center;
      }

      .hint-close {
        background: none;
        border: none;
        color: #888;
        font-size: 0.75rem;
        cursor: pointer;
        padding: 0 2px;
        line-height: 1;
        transition: color 0.2s;
      }

      .hint-close:hover {
        color: #c5c6c7;
      }
    `,
  ],
})
export class GuitarPedalsComponent implements OnInit {
  public readonly vm = inject(GuitarPedalsViewModel);
  public readonly showHint = signal(true);

  private readonly tourRef = viewChild(TourComponent);
  public readonly tourSteps = GUITAR_PEDALS_TOUR_STEPS;

  private readonly availableInputs = signal<MediaDeviceInfo[]>([]);

  public readonly inputOptions = computed<SelectOption[]>(() => {
    const devices = this.availableInputs();
    return [
      { label: 'Default Input', value: '' },
      ...devices.map((d, i) => ({
        label: d.label || `Input ${i + 1}`,
        value: d.deviceId,
      })),
    ];
  });

  constructor() {
    afterNextRender(() => {
      if (!localStorage.getItem(TOUR_STORAGE_KEY)) {
        setTimeout(() => this.tourRef()?.start(), 500);
      }
    });
  }

  public startTour(): void {
    this.tourRef()?.start();
  }

  public ngOnInit(): void {
    this.vm.loadInputs();
    this.vm.availableInputs$.subscribe((inputs) => {
      this.availableInputs.set(inputs);
    });
  }
}
