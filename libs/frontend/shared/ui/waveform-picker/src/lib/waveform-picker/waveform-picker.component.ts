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
        <ng-icon [name]="waveformMap[waveform]" size="1.8rem"></ng-icon>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .wave-selector {
        display: flex;
        gap: 12px;
        padding: 10px;
        background: #ffffff;
        border-radius: 8px;
        width: fit-content;
      }

      .wave-option {
        width: 45px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 2px solid #333;
        border-radius: 6px;
        color: #888;
        background: #eee;
        transition: all 0.2s ease-in-out;

        ng-icon {
          display: flex;
          color: inherit;
        }

        &:hover {
          border-color: #555;
          color: #555;
        }

        &.selected {
          border-color: #2978ff;
          color: #2978ff;
          background: #eef4ff;
          box-shadow: 0 0 10px rgba(41, 120, 255, 0.3);
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
