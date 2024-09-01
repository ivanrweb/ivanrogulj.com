import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OscillatorComponent } from '@ivanrogulj.com/oscillator';
import { AudioContextService } from '../../../../../shared/data-access/service/audio-context.service';
@Component({
  selector: 'lib-analog-synth',
  standalone: true,
  imports: [CommonModule, OscillatorComponent],
  providers: [AudioContextService],
  templateUrl: './analog-synth.component.html',
  styleUrl: './analog-synth.component.css',
})
export class AnalogSynthComponent {
  @Input()
  public oscillators: OscillatorNode[] = [];


  protected audioContextService = inject(AudioContextService);
}
