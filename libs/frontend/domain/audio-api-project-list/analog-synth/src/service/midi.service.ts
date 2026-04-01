import { Injectable } from '@angular/core';
import { filter, fromEventPattern, Observable, Subject, take, tap } from 'rxjs';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

@Injectable({ providedIn: 'root' })
export class MidiService {
  private frequencyLookup: number[] = [];
  private activeNotes = new Set<number>();

  private paramControlSubject = new Subject<{
    param: AnalogSynthApi.Knob;
    value: number;
  }>();
  public paramControl$: Observable<{
    param: AnalogSynthApi.Knob;
    value: number;
  }> = this.paramControlSubject.asObservable();
  private controlToParamMap = new Map<number, AnalogSynthApi.Knob>();
  private lastReceivedCC: number | null = null;

  //Subjects to emit when some value is mapped
  private mappingChangedSubject = new Subject<AnalogSynthApi.Knob>();
  public mappingChanged$ = this.mappingChangedSubject.asObservable();

  public noteOn$ = new Subject<AnalogSynthApi.NoteOn>();
  public noteOff$ = new Subject<{ note: number }>();

  private midiAccess: MIDIAccess | null = null;

  private mappingInProgress = false;
  private pendingParam: AnalogSynthApi.Knob | null = null;

  constructor() {
    for (let note = 0; note <= 127; note++) {
      this.frequencyLookup[note] = this.midiToFreq(note);
    }

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(this.successMIDI).catch(this.failMIDI);
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
      window.alert(
        'Connected device: ' + port.name + ', IN/OUT type: ' + port.type
      );
    } else if (port.state === 'disconnected') {
      window.alert(
        'Disconnected device: ' + port.name + ', IN/OUT type: ' + port.type
      );
    }
  };

  public handleInput = (event: MIDIMessageEvent): void => {
    const data = event.data;
    if (!data) return;

    const [status, data1, data2] = data;

    // Ignore MIDI timing clock messages
    if (status === 0xf8) return;

    const messageType = status & 0xf0;

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

      case 0xb0: // Control Change (CC)
        this.lastReceivedCC = data1;

        if (this.mappingInProgress && this.pendingParam) {
          this.mapControlToParam(this.pendingParam);
          return;
        }

        // eslint-disable-next-line no-case-declarations
        const param = this.controlToParamMap.get(data1);
        if (param) {
          this.paramControlSubject.next({ param, value: data2 / 127 });
        }
        break;

      default:
        break;
    }
  };

  public startMapping(param: AnalogSynthApi.Knob): void {
    if (!this.midiAccess) {
      console.warn('MIDI access not available');
      return;
    }

    this.mappingInProgress = true;
    this.pendingParam = param;

    const addHandler = (handler: (event: MIDIMessageEvent) => void): void => {
      this.midiAccess!.inputs.forEach((input) =>
        input.addEventListener('midimessage', handler)
      );
    };

    const removeHandler = (
      handler: (event: MIDIMessageEvent) => void
    ): void => {
      this.midiAccess!.inputs.forEach((input) =>
        input.removeEventListener('midimessage', handler)
      );
    };

    fromEventPattern<MIDIMessageEvent>(addHandler, removeHandler)
      .pipe(
        filter((event) => !!event.data && (event.data[0] & 0xf0) === 0xb0), // Only CC messages
        take(1),
        tap((event) => {
          if (!event.data) return;

          const ccNumber = event.data[1];

          this.controlToParamMap.set(ccNumber, this.pendingParam!);

          console.log(
            `Mapped CC ${ccNumber} to pendingParam ${this.pendingParam}`
          );

          this.mappingInProgress = false;
          this.pendingParam = null;
        })
      )
      .subscribe();
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

  public unmapParam(param: AnalogSynthApi.Knob): void {
    for (const [cc, mappedParam] of this.controlToParamMap.entries()) {
      if (mappedParam === param) {
        this.controlToParamMap.delete(cc);
        break;
      }
    }
  }

  public mapControlToParam(param: AnalogSynthApi.Knob): void {
    if (this.lastReceivedCC !== null) {
      this.controlToParamMap.set(this.lastReceivedCC, param);

      this.mappingChangedSubject.next(param);
    }

    console.log('controlToParamMap: ', this.controlToParamMap);
  }
}
