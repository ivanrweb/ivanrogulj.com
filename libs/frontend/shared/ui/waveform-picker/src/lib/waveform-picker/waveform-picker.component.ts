import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-waveform-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './waveform-picker.component.html',
  styleUrl: './waveform-picker.component.scss',
})
export class WaveformPickerComponent {
  @Input()
  public waveforms: string[] = [];
  @Input()
  public selectedWaveform = '';
  @Output()
  public waveformChange = new EventEmitter<OscillatorType>();

  public selectWaveform(waveform: string): void {
    const mappedWaveform = waveform as OscillatorType;
    this.waveformChange.emit(mappedWaveform);
  }
}
