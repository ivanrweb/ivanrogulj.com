import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioContextService } from '../../../../../../shared/data-access/service/audio-context.service';

@Component({
  selector: 'lib-oscillator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oscillator.component.html',
  styleUrl: './oscillator.component.css',
})
export class OscillatorComponent {

  @Input()
  public type: OscillatorType = 'sine';

  public osc1?: OscillatorNode;

  private audioContextService = inject(AudioContextService);

  public createFirstOscillator(): void {
    this.osc1 = this.audioContextService.createAndStartOsc();
    this.audioContextService.connectArrayOfAudioNodes([this.osc1]);
    console.log('first osc: ' + JSON.stringify(this.osc1));
  }

  public stopFirstOscillator(): void {
    this.audioContextService.stopSound(this.osc1!);
  }
}
