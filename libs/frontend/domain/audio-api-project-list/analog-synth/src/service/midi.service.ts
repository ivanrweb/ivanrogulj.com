import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MidiService {
  private frequencyLookup: number[] = [];

  private activeNotes = new Set<number>();
  public noteOn$ = new Subject<{ note: number, velocity: number }>();
  public noteOff$ = new Subject<{ note: number }>();

  constructor() {
    //provided by the Web MIDI API, asks the browser for access to MIDI devices
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(this.successMIDI, this.failMIDI);
    }

    // Precompute frequencies for MIDI notes 0 to 127
    for (let note = 0; note <= 127; note++) {
      this.frequencyLookup[note] = this.midiToFreq(note);
    }
  }

  public successMIDI = (midiAccess: any): void => {
    midiAccess.onstatechange = this.updateDevices;

    midiAccess.inputs.forEach((input: any) => {
      input.addEventListener('midimessage', this.handleInput);
    });
  };

  public failMIDI = (): void => {
    console.log('No MIDI devices connected.');
  };

  public updateDevices = (event: any): void => {
    if (event.port.state === 'connected') {
      window.alert('Connected device: ' + event.port.name + ', IN/OUT type: ' + event.port.type);
    } else if (event.port.state === 'disconnected') {
      window.alert('Disconnected device: ' + event.port.name + ', IN/OUT type: ' + event.port.type);
    }
  };

  public handleInput = (event: any): void => {
    console.log('MIDI event:', event);

    const [cc, note, velocity] = event.data;

    // Ignore MIDI timing clock
    if (cc === 248) return;

    if (cc === 144 && velocity > 0) {
      // Note ON
      if (!this.activeNotes.has(note)) {
        this.activeNotes.add(note);
        this.noteOn$.next({ note, velocity });
      }
    } else if ((cc === 128) || (cc === 144 && velocity === 0)) {
      // Note OFF
      if (this.activeNotes.has(note)) {
        this.activeNotes.delete(note);
        this.noteOff$.next({ note });
      }
    }
  };

  public midiToFreq(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  public getFrequency(note: number): number {
    return this.frequencyLookup[note];
  }

  public getVelocityBetweenZeroAndOne(velocity: number): number {
    if (velocity < 0 || velocity > 128) {
      throw new Error('Velocity must be in the range 0-128.');
    }

    // Rescale the velocity to a 0-1 range
    return velocity / 128;
  }
}
