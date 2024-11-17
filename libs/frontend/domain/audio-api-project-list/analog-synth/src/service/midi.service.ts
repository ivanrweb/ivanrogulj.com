import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MidiService {
  private frequencyLookup: number[] = [];

  public noteOn$ = new Subject<{ note: number, velocity: number }>();
  public noteOff$ = new Subject<{ note: number }>();

  constructor() {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(this.successMIDI.bind(this), this.failMIDI);
    }

    // Precompute frequencies for MIDI notes 0 to 127
    for (let note = 0; note <= 127; note++) {
      this.frequencyLookup[note] = this.midiToFreq(note);
    }
  }

  public successMIDI(midiAccess: any): void {
    midiAccess.onstatechange = this.updateDevices.bind(this);

    const inputs = midiAccess.inputs;
    inputs.forEach((input: any) => {
      input.addEventListener('midimessage', this.handleInput.bind(this));
    });
  }

  public failMIDI(): void {
    console.log('No MIDI devices connected.');
  }

  public updateDevices(event: any): void {
    if (event.port.state === 'connected') {
      window.alert('Connected device: ' + event.port.name + ', IN/OUT type: ' + event.port.type);
    } else if (event.port.state === 'disconnected') {
      window.alert('Disconnected device: ' + event.port.name + ', IN/OUT type: ' + event.port.type);
    }
  }

  public handleInput(event: any): void {
    if (!(event.data[0] === 248)) {
      const cc = event.data[0];
      const note = event.data[1];
      const velocity = event.data[2];

      switch (cc) {
        case 144: // Note on message
          this.noteOn$.next({ note, velocity });
          break;
        case 128: // Note off message
          this.noteOff$.next({ note });
          break;
        default:
          // Handle other messages if needed
          break;
      }
    }
  }

  public midiToFreq(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  public getFrequency(note: number): number {
    return this.frequencyLookup[note];
  }

  public getVelocityBetweenZeroAndOne(velocity: number): number {
    // Ensure the velocity is within the valid range
    if (velocity < 0 || velocity > 128) {
      throw new Error('Velocity must be in the range 0-128.');
    }

    // Rescale the velocity to a 0-1 range
    return velocity / 128;
  }
}
