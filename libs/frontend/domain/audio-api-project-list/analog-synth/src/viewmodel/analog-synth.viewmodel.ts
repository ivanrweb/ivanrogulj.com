import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Filter } from '@ivanrogulj.com/filter';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Oscillator } from '@ivanrogulj.com/oscillator';
import { v7 as uuidv7 } from 'uuid';
import { AudioContextService } from '../service/audio-context.service';
import { MidiService } from '../service/midi.service';

export interface AnalogSynthState {
  oscillators: Oscillator[];
  filters: Filter[];
}

@Injectable({
  providedIn: 'root',
})
export class AnalogSynthViewModel extends ComponentStore<AnalogSynthState> {
  public readonly vm$: Observable<AnalogSynthState> = this.select(state => ({
    oscillators: state.oscillators,
    filters: state.filters,
  }));

  //Mapping to know which pressed key starts which oscillator
  private midiNoteToOscillatorMap = new Map<number, Oscillator>();

  constructor(private readonly audioContextService: AudioContextService, private readonly midiService: MidiService) {
    super({
      oscillators: [],
      filters: [],
    });

    this.midiService.noteOn$.subscribe(({ note }) => {
      const frequency = this.midiService.getFrequency(note);
      const oscillator = this.createOscillator(frequency);
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
  public createOscillator(frequency?: number): Oscillator {
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

    // Create filter and connect to oscillator
    const filter = this.createFilter(newOsc.id); // Pass the oscillator ID

    //Connect all nodes in chain
    this.audioContextService.connectArrayOfAudioNodes([newOsc.node, filter.node]);

    // Update state with the new oscillator and filter
    this.patchState((state) => ({
      oscillators: [...state.oscillators, newOsc],
      filters: [...state.filters, filter],
    }));

    return newOsc;
  }

  public stopOscillator(oscId: string): void {
    this.patchState((state) => {
      const updatedOscillators = state.oscillators.filter((osc) => {
        if (osc.id === oscId) {
          this.audioContextService.stopAndDisconnect(osc.node);
          return false; // Exclude this oscillator from the list
        }
        return true;
      });

      // Remove the filters associated with the stopped oscillator
      const updatedFilters = state.filters.filter(filter => filter.id !== oscId);

      return {
        ...state,
        oscillators: updatedOscillators,
        filters: updatedFilters,
      };
    });
  }

  public createFilter(oscillatorId: string): Filter {
    const filterNode = this.audioContextService.createFilter();
    const newFilter: Filter = {
      id: oscillatorId, // Associate filter with oscillator by using the oscillator ID
      frequency: 5000,
      type: 'lowpass',
      node: filterNode,
    };

    return newFilter;
  }

  public updateFilter(filterId: string, newFilterValue: number): void {
    this.patchState((state) => {
      const updatedFilters = state.filters.map((filter) => {
        if (filter.id === filterId) {
          filter.node.frequency.value = newFilterValue; // Update filter node directly
          return {
            ...filter,
            frequency: newFilterValue,
          };
        }
        return filter;
      });

      return {
        ...state,
        filters: updatedFilters,
      };
    });
  }

  public updateGain(gainValue: number): void {
    this.audioContextService.updateGain(gainValue);
  }
}
