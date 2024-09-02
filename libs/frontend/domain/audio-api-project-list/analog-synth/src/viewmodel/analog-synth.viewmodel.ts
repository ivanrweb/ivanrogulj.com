import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Filter } from '@ivanrogulj.com/filter';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Oscillator } from '@ivanrogulj.com/oscillator';
import { v7 as uuidv7 } from 'uuid';
import { AudioContextService } from '../service/audio-context.service';

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

  constructor (private readonly audioContextService: AudioContextService){
    super({
      oscillators: [],
      filters: [],
    });
  }

  // Method to create and start a new oscillator
  public createOscillator(): void {
    const oscNode = this.audioContextService.createAndStartOsc();
    const newOsc: Oscillator = {
      id: uuidv7(),
      type: oscNode.type,
      frequency: oscNode.frequency.value,
      detune: oscNode.detune.value,
      isPlaying: true,
      node: oscNode,
    };

    this.patchState((state) => ({
      oscillators: [...state.oscillators, newOsc],
    }));

    //Create Filter for every Oscillator
    const filter = this.createFilter();

    //Connect all nodes in chain
    this.connectNodes([newOsc.node, filter.node]);
  }

  // Method to stop an oscillator
  public stopOscillator(oscId: string): void {
    this.patchState((state) => {
      const updatedOscillators = state.oscillators.map((osc) => {
        if (osc.id === oscId) {
          this.audioContextService.stopSound(osc.node);
          return { ...osc, isPlaying: false };
        }
        return osc;
      });

      return {
        ...state,
        oscillators: updatedOscillators,
      };
    });
  }


  // Create a new filter
  public createFilter(): Filter {
    const filterNode = this.audioContextService.setFilter();
    const newFilter: Filter = {
      id: uuidv7(),
      frequency: filterNode.frequency.value,
      type: filterNode.type,
      node: filterNode,
    };

    this.patchState((state) => ({
      filters: [...state.filters, newFilter],
    }));

    return newFilter;
  }

  // Update an existing filter
  public updateFilter(filterId: string, newFilterValue: number): void {
    this.patchState((state) => {
      const updatedFilters = state.filters.map((filter) => {
        if (filter.id === filterId) {
          // Update the filter properties and create a new filter node
          const updatedFilterNode = this.audioContextService.setFilter();
          return {
            ...filter,
            frequency: newFilterValue,
            type: updatedFilterNode.type,
            node: updatedFilterNode,
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

  // Method to connect nodes
  public connectNodes(nodes: AudioNode[]): void {
    this.audioContextService.connectArrayOfAudioNodes(nodes);
  }

}
