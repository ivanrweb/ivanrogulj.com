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
        background: #0b0c10;
        border-radius: 6px;
        border: 1px solid #333;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.8);
        width: fit-content;
      }

      .wave-option {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid #333;
        border-radius: 4px;
        color: #c5c6c7;
        background: #1f2833;
        transition: all 0.2s ease-in-out;

        ng-icon {
          display: flex;
          color: inherit;
        }

        &:hover {
          border-color: #555;
          color: #ffffff;
          background: #2a3545;
        }

        &.selected {
          border-color: #66fcf1;
          color: #66fcf1;
          background: rgba(102, 252, 241, 0.1);
          box-shadow: 0 0 8px rgba(102, 252, 241, 0.3);
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
