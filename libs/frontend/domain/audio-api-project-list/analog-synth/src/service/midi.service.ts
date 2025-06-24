import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ADSR } from '@ivanrogulj.com/gain';

@Injectable({ providedIn: 'root' })
export class MidiService {
  private frequencyLookup: number[] = [];
  private activeNotes = new Set<number>();

  private paramControlSubject = new Subject<{ param: keyof ADSR | 'masterGain' | 'filterFrequency' | 'filterResonance'; value: number }>();
  public paramControl$: Observable<{ param: keyof ADSR | 'masterGain' | 'filterFrequency' | 'filterResonance'; value: number }> = this.paramControlSubject.asObservable();
  private controlToParamMap = new Map<number, keyof ADSR | 'masterGain' | 'filterFrequency' | 'filterResonance'>();
  private lastReceivedCC: number | null = null;

  public noteOn$ = new Subject<{ note: number; velocity: number }>();
  public noteOff$ = new Subject<{ note: number }>();

  private midiAccess: MIDIAccess | null = null;

  private ccToParamDynamicMap = new Map<number, keyof ADSR | 'masterGain' | 'filterFrequency' | 'filterResonance'>();
  private mappingInProgress = false;
  private pendingParam: keyof ADSR | 'masterGain' | 'filterFrequency' | 'filterResonance' | null = null;


  constructor() {
    for (let note = 0; note <= 127; note++) {
      this.frequencyLookup[note] = this.midiToFreq(note);
    }

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then(this.successMIDI)
        .catch(this.failMIDI);
    }
  }

  public successMIDI = (midiAccess: MIDIAccess): void => {
    this.midiAccess = midiAccess;
    midiAccess.onstatechange = this.updateDevices;

    midiAccess.inputs.forEach((input) => {
      input.addEventListener('midimessage', this.handleInput);
    });
  };

  public failMIDI = (): void => {
    console.log('No MIDI devices connected.');
  };

  public updateDevices = (event: MIDIConnectionEvent): void => {
    const port = event.port;
    if (!port) return;

    if (port.state === 'connected') {
      window.alert('Connected device: ' + port.name + ', IN/OUT type: ' + port.type);
    } else if (port.state === 'disconnected') {
      window.alert('Disconnected device: ' + port.name + ', IN/OUT type: ' + port.type);
    }
  };

  public handleInput = (event: MIDIMessageEvent): void => {
    if (!event.data) return;

    const [status, data1, data2] = event.data;

    // Ignore MIDI timing clock
    if (status === 0xF8) return;

    const messageType = status & 0xF0;

    switch (messageType) {
      case 0x90: // Note On
        if (data2 > 0) {
          if (!this.activeNotes.has(data1)) {
            this.activeNotes.add(data1);
            this.noteOn$.next({ note: data1, velocity: data2 });
          }
        } else {
          // Note On with velocity 0 is Note Off
          if (this.activeNotes.has(data1)) {
            this.activeNotes.delete(data1);
            this.noteOff$.next({ note: data1 });
          }
        }
        break;

      case 0x80: // Note Off
        if (this.activeNotes.has(data1)) {
          this.activeNotes.delete(data1);
          this.noteOff$.next({ note: data1 });
        }
        break;

      case 0xB0: // Control Change (CC)
        this.lastReceivedCC = data1;

        if (this.mappingInProgress && this.pendingParam) {
          this.ccToParamDynamicMap.set(data1, this.pendingParam);
          this.mappingInProgress = false;
          this.pendingParam = null;
          return;
        }

        if (this.ccToParamDynamicMap.has(data1)) {
          const param = this.ccToParamDynamicMap.get(data1)!;
          this.paramControlSubject.next({ param, value: data2 / 127 });
        }
        break;

      default:
        break;
    }
  };

  public startMapping(param: keyof ADSR | 'filterFrequency' | 'filterResonance' | 'masterGain' | null): void {
    this.mappingInProgress = true;
    this.pendingParam = param;

    // Single-time listen to CC which is emmited so you can map controller to parameter
    const listener = (event: MIDIMessageEvent): void => {
      if (event.data) {
        const [status, ccNumber, value] = event.data;

        // CC message status range: 0xB0 - 0xBF
        if ((status & 0xF0) === 0xB0 && this.mappingInProgress && this.pendingParam) {
          this.controlToParamMap.set(ccNumber, this.pendingParam);
          this.mappingInProgress = false;
          this.pendingParam = null;

          console.log(`Mapped CC ${ccNumber} to param ${this.pendingParam}`);

          // remove listener
          this.midiAccess?.inputs.forEach(input => {
            input.removeEventListener('midimessage', listener);
          });
        }
      }
    };

    this.midiAccess?.inputs.forEach(input => {
      input.addEventListener('midimessage', listener);
    });
  }


  public midiToFreq(midiNote: number): number {
    // Precomputed frequencies from AnalogSynthApi.KeyboardFrequencies
    return AnalogSynthApi.KeyboardFrequencies[midiNote];
  }

  public getFrequency(note: number): number {
    return this.frequencyLookup[note];
  }

  public getVelocityBetweenZeroAndOne(velocity: number): number {
    if (velocity < 0 || velocity > 128) {
      throw new Error('Velocity must be in the range 0-128.');
    }
    return velocity / 128;
  }

  public mapControlToParam(param: keyof ADSR | 'masterGain' | 'filterFrequency' | 'filterResonance'): void {
    // The last received MIDI CC control is the one that needs to be mapped
    const lastCC = this.lastReceivedCC;
    if (lastCC != null) {
      this.controlToParamMap.set(lastCC, param);
    }
  }
}
