import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MidiService {
  public midiMessage$ = new Subject<{ note: number, velocity: number }>();

  constructor() {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(this.successMIDI.bind(this), this.failMIDI);
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
          this.midiMessage$.next({ note, velocity });
          break;
        case 128: // Note off message
                  // Handle note off if needed
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
}
