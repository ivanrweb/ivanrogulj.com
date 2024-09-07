import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Oscillator } from '@ivanrogulj.com/oscillator';
import { v7 as uuidv7 } from 'uuid';
import { AudioContextService } from '../service/audio-context.service';
import { MidiService } from '../service/midi.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ADSR, Gain } from '@ivanrogulj.com/gain';

export interface AnalogSynthState {
  oscillators: Oscillator[];
  volumeEnvelope: ADSR;
  gains: Gain[];
}

@Injectable({
  providedIn: 'root',
})
export class AnalogSynthViewModel extends ComponentStore<AnalogSynthState> {
  public readonly vm$: Observable<AnalogSynthState> = this.select(state => ({
    oscillators: state.oscillators,
    volumeEnvelope: state.volumeEnvelope,
    gains: state.gains,
  }));

  private midiNoteToOscillatorMap = new Map<number, string>(); // Maps MIDI note to oscillator ID

  constructor(private readonly audioContextService: AudioContextService, private readonly midiService: MidiService) {
    super({
      oscillators: [],
      volumeEnvelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 1,
        release: 0.5,
      },
      gains: [],
    });

    this.midiService.noteOn$.subscribe(({ note }) => {
      const frequency = this.midiService.getFrequency(note);
      const oscillator = this.createAndStartOscillator(frequency);
      this.midiNoteToOscillatorMap.set(note, oscillator.id);
    });

    this.midiService.noteOff$.subscribe(({ note }) => {
      const oscId = this.midiNoteToOscillatorMap.get(note);
      if (oscId) {
        this.stopOscillator(oscId);
        this.midiNoteToOscillatorMap.delete(note);
      }
    });
  }

  public createAndStartOscillator(frequency?: number): Oscillator {
    const oscNode = this.audioContextService.createAndStartOsc(frequency);
    const gainNode = this.audioContextService.createGain();
    const oscId = uuidv7(); // Unique ID for the oscillator and gain

    const newOsc: Oscillator = {
      id: oscId,
      type: oscNode.type,
      frequency: oscNode.frequency.value,
      detune: oscNode.detune.value,
      isPlaying: true,
      node: oscNode,
    };

    // Connect oscillator to gain node
    this.audioContextService.connectOscillatorToGain(oscNode, gainNode);
    this.audioContextService.updateVolumeEnvelope(gainNode, this.get().volumeEnvelope);

    // Update state
    this.patchState((state) => ({
      oscillators: [...state.oscillators, newOsc],
      gains: [...state.gains, { id: oscId, gainNode }],
    }));

    return newOsc; // Return the oscillator object
  }

  private releaseOscillator(oscillator: Oscillator): void {
    const gainNodeEntry = this.get().gains.find(entry => entry.id === oscillator.id);

    if (gainNodeEntry) {
      this.audioContextService.releaseVolumeEnvelope(gainNodeEntry.gainNode, this.get().volumeEnvelope.release);

      setTimeout(() => {
        this.audioContextService.stopAndDisconnect(oscillator.node, gainNodeEntry.gainNode);
        this.patchState((state) => ({
          gains: state.gains.filter(entry => entry.id !== oscillator.id),
        }));
      }, this.get().volumeEnvelope.release * 1000);
    }
  }

  public stopOscillator(oscId: string): void {
    this.patchState((state) => {
      const updatedOscillators = state.oscillators.filter(osc => {
        if (osc.id === oscId) {
          this.releaseOscillator(osc);
          return false;
        }
        return true;
      });
      return {
        ...state,
        oscillators: updatedOscillators,
      };
    });
  }

  public updateFilter(frequency: number): void {
    this.audioContextService.updateFilter(frequency);
  }

  public updateGain(gainValue: number): void {
    this.audioContextService.updateGain(gainValue);
  }

  public updateVolumeEnvelope(partial: Partial<ADSR>): void {
    this.patchState((state) => ({
      volumeEnvelope: {
        ...state.volumeEnvelope,
        ...partial,
      },
    }));

    this.get().gains.forEach(({ gainNode }) => {
      this.audioContextService.updateVolumeEnvelope(gainNode, this.get().volumeEnvelope);
    });
  }
}
