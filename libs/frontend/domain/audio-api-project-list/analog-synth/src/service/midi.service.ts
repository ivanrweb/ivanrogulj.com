import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MidiService {

  constructor() {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(
        this.successMIDI.bind(this),
        this.failMIDI.bind(this)
      );
    }
  }

  public successMIDI(midiAccess: any): void {
    // info about connected/disconnected
    midiAccess.onstatechange = this.updateDevices.bind(this);

    // call input actions
    const inputs = midiAccess.inputs;
    inputs.forEach((input: any) => {
      console.log(input);
      input.addEventListener('midimessage', this.handleInput.bind(this));
    });
  }

  public failMIDI(): void {
    console.log('No MIDI devices connected.');
  }

  public updateDevices(event: any): void {
    console.log(event);
    if (event.port.state === 'connected') {
      window.alert('Connected device: ' + event.port.name + ', IN/OUT type: ' + event.port.type);
    } else if (event.port.state === 'disconnected') {
      window.alert('Disconnected device: ' + event.port.name + ', IN/OUT type: ' + event.port.type);
    }
  }

  public handleInput(event: any): void {
    if (event.data[0] !== 248) {
      const cc = event.data[0];
      const note = event.data[1];
      const velocity = event.data[2];

      switch (cc) {
        case 128:
          // noteOff(note, velocity);
          break;
        default:
        // noteOn(note, velocity);
      }
    }
  }

  public midiToFreq(note: any): number {
    return 440 * 2 * Math.pow(2, (note - 69) / 12);
  }
}
