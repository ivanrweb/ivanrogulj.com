import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Oscillator } from '@ivanrogulj.com/oscillator';
import { v7 as uuidv7 } from 'uuid';
import { AudioContextService } from '../service/audio-context.service';
import { MidiService } from '../service/midi.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ADSR } from '@ivanrogulj.com/gain';

export interface AnalogSynthState {
  oscillators: Oscillator[];
  volumeEnvelope: ADSR;
}

@Injectable({
  providedIn: 'root',
})
export class AnalogSynthViewModel extends ComponentStore<AnalogSynthState> {
  public readonly vm$: Observable<AnalogSynthState> = this.select(state => ({
    oscillators: state.oscillators,
    volumeEnvelope: state.volumeEnvelope,
  }));

  //Mapping to know which pressed key starts which oscillator
  private midiNoteToOscillatorMap = new Map<number, Oscillator>();

  constructor(private readonly audioContextService: AudioContextService, private readonly midiService: MidiService) {
    super({
      oscillators: [],
      volumeEnvelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 1,
        release: 0
      }
    });

    this.midiService.noteOn$.subscribe(({ note }) => {
      const frequency = this.midiService.getFrequency(note);
      const oscillator = this.createAndStartOscillator(frequency);
      this.midiNoteToOscillatorMap.set(note, oscillator);
    });

    this.midiService.noteOff$.subscribe(({ note }) => {
      const oscillator = this.midiNoteToOscillatorMap.get(note);
      if (oscillator) {
        this.stopOscillator(oscillator.id);
        this.midiNoteToOscillatorMap.delete(note);
      }
    });
  }

  // Method to create and start a new oscillator
  public createAndStartOscillator(frequency?: number): Oscillator {
    const oscNode = this.audioContextService.createAndStartOsc();
    oscNode.frequency.value = frequency ?? 440;

    const newOsc: Oscillator = {
      id: uuidv7(),
      type: oscNode.type,
      frequency: oscNode.frequency.value,
      detune: oscNode.detune.value,
      isPlaying: true,
      node: oscNode,
    };

    //Connect all nodes in chain
    this.audioContextService.connectArrayOfAudioNodes([newOsc.node]);

    this.updateVolumeEnvelope(this.get().volumeEnvelope);

    // Update state with the new oscillator
    this.patchState((state) => ({
      oscillators: [...state.oscillators, newOsc],
    }));

    return newOsc;
  }

  private releaseOscillator(oscillator: Oscillator): void {
    this.audioContextService.releaseVolumeEnvelope(this.get().volumeEnvelope.release);

    // Stop oscillator after the release phase
    setTimeout(() => {
      this.audioContextService.stopAndDisconnect(oscillator.node);
    }, this.get().volumeEnvelope.release * 1000);
  }

  public stopOscillator(oscId: string): void {
    this.patchState((state) => {
      const updatedOscillators = state.oscillators.filter((osc) => {
        if (osc.id === oscId) {
          this.releaseOscillator(osc);
          return false; // Exclude this oscillator from the list
        }
        return true;
      });

      return {
        ...state,
        oscillators: updatedOscillators
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
        ...partial
      }
    }));

    console.log('this is immediately called');
    this.audioContextService.updateVolumeEnvelope(this.get().volumeEnvelope);
  }
}
