import {
  Component,
  inject,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { SequencerViewModel } from '@ivanrogulj.com/analog-synth';

const NOTE_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
];

function midiToName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[midi % 12]}${octave}`;
}

@Component({
  selector: 'lib-sequencer',
  standalone: true,
  imports: [CommonModule, FormsModule, SlicePipe],
  template: `
    @if (vm.vm$ | async; as state) {
    <div class="seq-root">
      <div class="seq-header">
        <span class="seq-title">STEP SEQUENCER</span>
        <div class="seq-controls">
          <div class="bpm-control">
            <button
              class="bpm-btn"
              (mousedown)="startBpmChange(-1)"
              (mouseup)="stopBpmChange()"
              (mouseleave)="stopBpmChange()"
            >-</button>

            <div class="bpm-display">
              @if (bpmEditMode) {
              <input
                #bpmInput
                class="bpm-input"
                type="number"
                min="10"
                max="999"
                [(ngModel)]="bpmInputValue"
                (blur)="commitBpmEdit()"
                (keydown.enter)="commitBpmEdit()"
                (keydown.escape)="bpmEditMode = false"
                (click)="$event.stopPropagation()"
              />
              } @else {
              <span class="bpm-val" (click)="startBpmEdit(state.bpm)">{{ state.bpm }}</span>
              <span class="bpm-unit">BPM</span>
              }
            </div>

            <button
              class="bpm-btn"
              (mousedown)="startBpmChange(1)"
              (mouseup)="stopBpmChange()"
              (mouseleave)="stopBpmChange()"
            >+</button>
          </div>

          <button
            class="play-btn"
            [class.playing]="state.isPlaying"
            (click)="vm.togglePlayStop()"
          >
            <span class="play-icon">{{ state.isPlaying ? '■' : '▶' }}</span>
            {{ state.isPlaying ? 'STOP' : 'PLAY' }}
          </button>
        </div>
      </div>

      <div class="steps-grid">
        @for (step of state.steps | slice:0:(state.rowCount * 8); track $index) {
        <div
          class="step-wrap"
          [class.drag-over]="dragOverIndex === $index"
          (dragover)="$event.preventDefault(); dragOverIndex = $index"
          (dragleave)="dragOverIndex = null"
          (drop)="$event.preventDefault(); onDrop($index)"
        >
          <div
            class="step-btn"
            [class.active]="step.active"
            [class.current]="state.currentStep === $index && state.isPlaying"
            [class.armed]="state.armedStepIndex === $index"
            [draggable]="step.active"
            (dragstart)="onDragStart($index)"
            (dragend)="dragOverIndex = null"
            (click)="onStepClick($index, state.armedStepIndex)"
            (contextmenu)="$event.preventDefault(); openPicker($index)"
          >
            @if (state.armedStepIndex === $index) {
            <span class="armed-dot"></span>
            }
            <span class="step-num">{{ $index + 1 }}</span>
            @if (step.active) {
            <span class="step-note">{{ noteName(step.note) }}</span>
            <div class="vel-bar-wrap">
              <div class="vel-bar" [style.width.%]="(step.velocity / 127) * 100"></div>
            </div>
            } @else {
            <span class="step-dash">–</span>
            }
          </div>

          @if (activePickerIndex === $index) {
          <div
            class="note-picker"
            [class.picker-up]="isBottomRow($index, state.rowCount)"
            (click)="$event.stopPropagation()"
          >
            <div class="picker-header">
              <span class="picker-label">STEP {{ $index + 1 }}</span>
              <button class="picker-close" (click)="closePicker()">✕</button>
            </div>

            <div class="picker-row">
              <span class="picker-sublabel">ACTIVE</span>
              <button
                class="toggle-btn"
                [class.on]="step.active"
                (click)="vm.toggleStep($index)"
              >{{ step.active ? 'ON' : 'OFF' }}</button>
            </div>

            <div class="picker-row">
              <span class="picker-sublabel">OCT</span>
              @for (oct of octaves; track oct) {
              <button
                class="picker-btn"
                [class.selected]="getOctave(step.note) === oct"
                (click)="setOctave($index, step.note, oct)"
              >{{ oct }}</button>
              }
            </div>

            <div class="note-row">
              @for (n of noteNames; track n) {
              <button
                class="note-btn"
                [class.selected]="getNoteIndex(step.note) === getNoteIndexByName(n)"
                [class.sharp]="n.includes('#')"
                (click)="setNoteName($index, step.note, n)"
              >{{ n }}</button>
              }
            </div>

            <div class="picker-row vel-row">
              <span class="picker-sublabel">VEL</span>
              <input
                type="range"
                class="vel-slider"
                min="1"
                max="127"
                [ngModel]="step.velocity"
                (ngModelChange)="vm.setStepData({ index: $index, velocity: $event })"
              />
              <span class="vel-val">{{ step.velocity }}</span>
            </div>
          </div>
          }
        </div>
        }
      </div>

      @if (state.rowCount < 8) {
      <button class="add-row-btn" (click)="vm.addRow()">
        <span class="add-row-line"></span>
        <span class="add-row-label">+ ADD ROW</span>
        <span class="add-row-line"></span>
      </button>
      }
    </div>
    }
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap');

      :host {
        display: block;
        width: 100%;
        font-family: 'Fira Code', monospace;
      }

      .seq-root {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
      }

      .seq-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
      }

      .seq-title {
        font-size: 0.65rem;
        font-weight: 700;
        color: #888;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }

      .seq-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .bpm-control {
        display: flex;
        align-items: center;
        gap: 4px;
        background: #0b0c10;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 2px 6px;
      }

      .bpm-btn {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 700;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        padding: 0;
        line-height: 1;
        transition: color 0.1s;
        user-select: none;
      }

      .bpm-btn:hover { color: #66fcf1; }

      .bpm-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 36px;
        cursor: pointer;
      }

      .bpm-val {
        font-size: 0.85rem;
        font-weight: 700;
        color: #66fcf1;
        line-height: 1;
        border-bottom: 1px dashed transparent;
        transition: border-color 0.15s;
      }

      .bpm-val:hover {
        border-bottom-color: rgba(102, 252, 241, 0.4);
      }

      .bpm-unit {
        font-size: 0.48rem;
        color: #555;
        letter-spacing: 1px;
      }

      .bpm-input {
        width: 44px;
        background: transparent;
        border: none;
        border-bottom: 1px solid #66fcf1;
        color: #66fcf1;
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
        font-weight: 700;
        text-align: center;
        outline: none;
        padding: 0;
        line-height: 1;
        -moz-appearance: textfield;
      }

      .bpm-input::-webkit-inner-spin-button,
      .bpm-input::-webkit-outer-spin-button { -webkit-appearance: none; }

      .play-btn {
        background: #0b0c10;
        border: 1px solid #333;
        color: #c5c6c7;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 1px;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: all 0.15s;
        white-space: nowrap;
      }

      .play-btn:hover { border-color: #555; color: #fff; }

      .play-btn.playing {
        background: rgba(255, 0, 127, 0.1);
        border-color: #ff007f;
        color: #ff007f;
      }

      .play-icon { font-size: 0.6rem; }

      .steps-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 4px;
        width: 100%;
      }

      .step-wrap {
        position: relative;
        border-radius: 4px;
      }

      .step-wrap.drag-over > .step-btn {
        border-color: #ff007f;
        background: rgba(255, 0, 127, 0.1);
        box-shadow: 0 0 8px rgba(255, 0, 127, 0.3);
      }

      .step-btn {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: 2px;
        padding: 5px 3px 4px;
        border-radius: 4px;
        border: 1px solid #2a3040;
        background: #0d0f14;
        cursor: pointer;
        transition: all 0.1s ease;
        user-select: none;
        min-height: 54px;
        box-sizing: border-box;
        width: 100%;
      }

      .step-btn[draggable='true'] { cursor: grab; }
      .step-btn[draggable='true']:active { cursor: grabbing; }

      .step-btn:hover { border-color: #444; background: #1a2030; }

      .step-btn.active {
        background: rgba(102, 252, 241, 0.07);
        border-color: rgba(102, 252, 241, 0.4);
      }

      .step-btn.current {
        border-color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.04);
      }

      .step-btn.active.current {
        background: rgba(102, 252, 241, 0.18);
        border-color: #66fcf1;
        box-shadow: 0 0 10px rgba(102, 252, 241, 0.3);
      }

      .step-btn.armed {
        border-color: rgba(255, 204, 0, 0.7);
        background: rgba(255, 204, 0, 0.06);
        animation: armPulse 0.7s ease-in-out infinite alternate;
      }

      .armed-dot {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #ffcc00;
        box-shadow: 0 0 5px #ffcc00;
        animation: dotPulse 0.7s ease-in-out infinite alternate;
      }

      .step-num {
        font-size: 0.52rem;
        color: #444;
        font-weight: 700;
        line-height: 1;
      }

      .step-note {
        font-size: 0.65rem;
        color: #66fcf1;
        font-weight: 700;
        line-height: 1;
      }

      .step-dash {
        font-size: 0.65rem;
        color: #2a3040;
        line-height: 1;
        margin-top: 2px;
      }

      .vel-bar-wrap {
        width: 80%;
        height: 3px;
        background: rgba(102, 252, 241, 0.1);
        border-radius: 2px;
        overflow: hidden;
        margin-top: 3px;
      }

      .vel-bar {
        height: 100%;
        background: #66fcf1;
        border-radius: 2px;
        transition: width 0.1s;
      }

      /* Add row button */
      .add-row-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px 0;
        color: #555;
        font-family: 'Fira Code', monospace;
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 1px;
        transition: color 0.15s;
      }

      .add-row-btn:hover {
        color: #66fcf1;
      }

      .add-row-btn:hover .add-row-line {
        background: rgba(102, 252, 241, 0.3);
      }

      .add-row-label {
        white-space: nowrap;
        flex-shrink: 0;
      }

      .add-row-line {
        flex: 1;
        height: 1px;
        background: #2a3040;
        border-radius: 1px;
        transition: background 0.15s;
      }

      /* Note picker */
      .note-picker {
        position: absolute;
        top: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%);
        background: #1f2833;
        border: 1px solid #333;
        border-radius: 6px;
        padding: 10px;
        z-index: 600;
        min-width: 200px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        gap: 7px;
        animation: fadeIn 0.15s ease-out;
      }

      .note-picker.picker-up {
        top: auto;
        bottom: calc(100% + 6px);
        animation: fadeInUp 0.15s ease-out;
      }

      .picker-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .picker-label {
        font-size: 0.62rem;
        color: #66fcf1;
        letter-spacing: 1.5px;
        font-weight: 700;
      }

      .picker-sublabel {
        font-size: 0.55rem;
        color: #555;
        letter-spacing: 1px;
        font-weight: 700;
        min-width: 28px;
        text-transform: uppercase;
      }

      .picker-close {
        background: none;
        border: none;
        color: #555;
        cursor: pointer;
        font-size: 0.8rem;
        padding: 0;
        line-height: 1;
        transition: color 0.1s;
      }

      .picker-close:hover { color: #c5c6c7; }

      .picker-row {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
      }

      .toggle-btn {
        background: #0b0c10;
        border: 1px solid #333;
        color: #888;
        padding: 3px 10px;
        border-radius: 3px;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        font-size: 0.62rem;
        font-weight: 700;
        transition: all 0.1s;
      }

      .toggle-btn.on {
        background: rgba(102, 252, 241, 0.1);
        border-color: #66fcf1;
        color: #66fcf1;
      }

      .picker-btn {
        background: #0b0c10;
        border: 1px solid #333;
        color: #888;
        padding: 3px 6px;
        border-radius: 3px;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        font-size: 0.62rem;
        font-weight: 700;
        transition: all 0.1s;
        line-height: 1;
        min-width: 22px;
        text-align: center;
      }

      .picker-btn:hover { border-color: #555; color: #c5c6c7; }

      .picker-btn.selected {
        background: rgba(102, 252, 241, 0.1);
        border-color: #66fcf1;
        color: #66fcf1;
      }

      .note-row {
        display: flex;
        gap: 3px;
        flex-wrap: wrap;
      }

      .note-btn {
        background: #0b0c10;
        border: 1px solid #333;
        color: #888;
        padding: 4px 5px;
        border-radius: 3px;
        cursor: pointer;
        font-family: 'Fira Code', monospace;
        font-size: 0.6rem;
        font-weight: 700;
        transition: all 0.1s;
        line-height: 1;
        min-width: 26px;
        text-align: center;
      }

      .note-btn:hover { border-color: #555; color: #c5c6c7; }
      .note-btn.sharp { color: #555; font-size: 0.55rem; }

      .note-btn.selected {
        background: rgba(102, 252, 241, 0.1);
        border-color: #66fcf1;
        color: #66fcf1;
      }

      .vel-row { align-items: center; gap: 6px; }

      .vel-slider {
        flex: 1;
        height: 3px;
        appearance: none;
        background: #333;
        border-radius: 2px;
        outline: none;
        cursor: pointer;
      }

      .vel-slider::-webkit-slider-thumb {
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #66fcf1;
        cursor: pointer;
        box-shadow: 0 0 4px rgba(102, 252, 241, 0.5);
      }

      .vel-val {
        font-size: 0.65rem;
        color: #66fcf1;
        font-weight: 700;
        min-width: 24px;
        text-align: right;
      }

      @keyframes armPulse {
        from { border-color: rgba(255, 204, 0, 0.4); }
        to   { border-color: #ffcc00; box-shadow: 0 0 8px rgba(255, 204, 0, 0.3); }
      }

      @keyframes dotPulse {
        from { opacity: 0.6; box-shadow: 0 0 3px #ffcc00; }
        to   { opacity: 1;   box-shadow: 0 0 8px #ffcc00; }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }

      @keyframes fadeInUp {
        from { opacity: 0; transform: translateX(-50%) translateY(4px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `,
  ],
})
export class SequencerComponent {
  public readonly vm = inject(SequencerViewModel);

  @ViewChild('bpmInput') private bpmInputRef?: ElementRef<HTMLInputElement>;

  public activePickerIndex: number | null = null;
  public dragOverIndex: number | null = null;
  public bpmEditMode = false;
  public bpmInputValue = '';

  private dragSourceIndex: number | null = null;
  private clipboard: { note: number; velocity: number } | null = null;
  private bpmInterval: ReturnType<typeof setInterval> | null = null;

  public readonly octaves = [2, 3, 4, 5, 6, 7];
  public readonly noteNames = NOTE_NAMES;

  public noteName(midi: number): string {
    return midiToName(midi);
  }

  public getOctave(midi: number): number {
    return Math.floor(midi / 12) - 1;
  }

  public getNoteIndex(midi: number): number {
    return midi % 12;
  }

  public getNoteIndexByName(name: string): number {
    return NOTE_NAMES.indexOf(name);
  }

  public onStepClick(index: number, armedIndex: number | null): void {
    if (armedIndex === index) {
      this.vm.disarm();
    } else {
      this.vm.armStep(index);
    }
  }

  public startBpmChange(delta: number): void {
    this.vm.setBpm(this.vm.getState().bpm + delta);
    this.bpmInterval = setInterval(() => {
      this.vm.setBpm(this.vm.getState().bpm + delta);
    }, 80);
  }

  public stopBpmChange(): void {
    if (this.bpmInterval !== null) {
      clearInterval(this.bpmInterval);
      this.bpmInterval = null;
    }
  }

  public startBpmEdit(currentBpm: number): void {
    this.bpmInputValue = String(currentBpm);
    this.bpmEditMode = true;
    setTimeout(() => this.bpmInputRef?.nativeElement?.focus(), 0);
  }

  public commitBpmEdit(): void {
    const val = parseInt(this.bpmInputValue, 10);
    if (!isNaN(val)) {
      this.vm.setBpm(val);
    }
    this.bpmEditMode = false;
  }

  public onDragStart(index: number): void {
    this.dragSourceIndex = index;
  }

  public onDrop(targetIndex: number): void {
    const source = this.dragSourceIndex;
    this.dragOverIndex = null;
    this.dragSourceIndex = null;
    if (source === null || source === targetIndex) return;
    const sourceStep = this.vm.getState().steps[source];
    this.vm.setStepData({ index: targetIndex, note: sourceStep.note, velocity: sourceStep.velocity, active: true });
    this.vm.setStepData({ index: source, active: false });
  }

  public openPicker(index: number): void {
    this.activePickerIndex = this.activePickerIndex === index ? null : index;
  }

  public closePicker(): void {
    this.activePickerIndex = null;
  }

  public setOctave(stepIndex: number, currentNote: number, octave: number): void {
    const newNote = (octave + 1) * 12 + (currentNote % 12);
    this.vm.setStepData({ index: stepIndex, note: Math.max(0, Math.min(127, newNote)) });
  }

  public setNoteName(stepIndex: number, currentNote: number, name: string): void {
    const octave = Math.floor(currentNote / 12) - 1;
    const newNote = (octave + 1) * 12 + NOTE_NAMES.indexOf(name);
    this.vm.setStepData({ index: stepIndex, note: Math.max(0, Math.min(127, newNote)) });
  }

  public isBottomRow(index: number, rowCount: number): boolean {
    return Math.floor(index / 8) >= rowCount - 2;
  }

  @HostListener('document:mouseup')
  public onDocumentMouseUp(): void {
    this.stopBpmChange();
  }

  @HostListener('document:keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    const { armedStepIndex, steps } = this.vm.getState();

    if (event.key === 'Backspace') {
      if (armedStepIndex === null) return;
      event.preventDefault();
      this.vm.setStepData({ index: armedStepIndex, active: false });
      this.vm.disarm();
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (armedStepIndex === null) return;
      const step = steps[armedStepIndex];
      if (!step.active) return;
      event.preventDefault();
      const newNote = Math.max(0, Math.min(127, step.note + (event.key === 'ArrowUp' ? 1 : -1)));
      this.vm.setStepData({ index: armedStepIndex, note: newNote });
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
      if (armedStepIndex === null) return;
      const step = steps[armedStepIndex];
      if (!step.active) return;
      event.preventDefault();
      this.clipboard = { note: step.note, velocity: step.velocity };
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
      if (armedStepIndex === null || this.clipboard === null) return;
      event.preventDefault();
      this.vm.setStepData({ index: armedStepIndex, note: this.clipboard.note, velocity: this.clipboard.velocity, active: true });
      this.vm.disarm();
      return;
    }
  }

  @HostListener('document:click')
  public onDocumentClick(): void {
    this.activePickerIndex = null;
  }
}
