import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'lib-waveform-picker',
  standalone: true,
  imports: [CommonModule, NgIcon],
  template: `
    <div class="wave-selector">
      @for (waveform of waveforms; track waveform) {
      <div
        class="wave-option"
        [class.selected]="selectedWaveform === waveform"
        (click)="selectWaveform(waveform)"
        [title]="waveform"
      >
        <ng-icon [name]="waveformMap[waveform]" size="1.4rem"></ng-icon>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .wave-selector {
        display: flex;
        gap: 8px;
        padding: 6px;
        background: #111;
        border-radius: 6px;
        border: 1px solid #333;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.8);
        width: fit-content;
      }

      .wave-option {
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid #333;
        border-radius: 4px;
        color: #d0d0d0;
        background: #1a1a1a;
        transition: all 0.2s ease-in-out;

        ng-icon {
          display: flex;
          color: inherit;
        }

        &:hover {
          border-color: #555;
          color: #ffffff;
          background: #222;
        }

        &.selected {
          border-color: #ff3333;
          color: #ff3333;
          background: rgba(255, 51, 51, 0.1);
          box-shadow: 0 0 8px rgba(255, 51, 51, 0.4);
          text-shadow: 0 0 5px rgba(255, 51, 51, 0.6);
        }
      }
    `,
  ],
})
export class WaveformPickerComponent {
  @Input() public waveforms: OscillatorType[] = [];
  @Input() public selectedWaveform: OscillatorType | string = '';
  @Output() public waveformChange = new EventEmitter<OscillatorType>();

  public waveformMap: Record<string, string> = {
    sine: 'phosphorWaveSine',
    square: 'phosphorWaveSquare',
    sawtooth: 'phosphorWaveSawtooth',
    triangle: 'phosphorWaveTriangle',
  };

  public selectWaveform(waveform: OscillatorType): void {
    this.waveformChange.emit(waveform);
  }
}
