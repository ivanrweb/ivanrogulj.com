import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { OscillatorComponent } from '@ivanrogulj.com/oscillator';
import { AudioContextService } from '../service/audio-context.service';
import { FilterComponent } from '@ivanrogulj.com/filter';
@Component({
  selector: 'lib-analog-synth',
  standalone: true,
  imports: [CommonModule, OscillatorComponent, FilterComponent],
  providers: [AudioContextService],
  templateUrl: './analog-synth.component.html',
  styleUrl: './analog-synth.component.css',
})
export class AnalogSynthComponent {
  @Input()
  public oscillators: OscillatorNode[] = [];


  protected audioContextService = inject(AudioContextService);
}

