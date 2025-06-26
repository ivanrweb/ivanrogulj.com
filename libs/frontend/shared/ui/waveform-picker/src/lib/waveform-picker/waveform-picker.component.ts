import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'lib-waveform-picker',
  standalone: true,
  imports: [],
  templateUrl: './waveform-picker.component.html',
  styleUrl: './waveform-picker.component.scss',
})
export class WaveformPickerComponent {
  @Input()
  public waveforms: OscillatorType[] = [];
  @Input()
  public selectedWaveform = '';
  @Output()
  public waveformChange = new EventEmitter<OscillatorType>();

  public selectWaveform(waveform: OscillatorType): void {
    this.waveformChange.emit(waveform);
  }
}
