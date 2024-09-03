import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { OscillatorComponent } from '@ivanrogulj.com/oscillator';
import { AudioContextService } from '../service/audio-context.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { FilterComponent } from '@ivanrogulj.com/filter';
import { GainComponent } from '@ivanrogulj.com/gain';
@Component({
  selector: 'lib-analog-synth',
  standalone: true,
  imports: [CommonModule, OscillatorComponent, FilterComponent, GainComponent],
  providers: [AudioContextService],
  templateUrl: './analog-synth.component.html',
  styleUrl: './analog-synth.component.css',
})
export class AnalogSynthComponent {
}

