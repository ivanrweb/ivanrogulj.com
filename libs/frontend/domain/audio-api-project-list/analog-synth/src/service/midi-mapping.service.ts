import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';

export interface MidiMapping {
  cc: number;
  componentId: string;
  callback: (value: number) => void;
}

export interface MidiMappingState {
  mappings: Map<number, MidiMapping>;
  learningMode: boolean;
  selectedComponent: Omit<MidiMapping, 'cc'> | null;
}

@Injectable({ providedIn: 'root' })
export class MidiMappingStore extends ComponentStore<MidiMappingState> {
  private midiAccess: MIDIAccess | null = null;

  constructor() {
    super({
      mappings: new Map(),
      learningMode: false,
      selectedComponent: null,
    });

    this.initMIDI();
  }

  private async initMIDI(): Promise<void> {
    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.midiAccess.inputs.forEach(input => {
        input.onmidimessage = this.handleMIDIMessage.bind(this);
      });
    } catch (err) {
      console.error('MIDI not available', err);
    }
  }

  private handleMIDIMessage(event: MIDIMessageEvent): void {
    const data = event.data;
    if (!data) return;

    const [status, cc, value] = data;
    if (status !== 0xb0) return; // Only handle CC messages

    const { learningMode, selectedComponent, mappings } = this.get();

    if (learningMode && selectedComponent) {
      mappings.set(cc, { ...selectedComponent, cc });
      this.patchState({ mappings, learningMode: false, selectedComponent: null });
      console.log(`Mapped CC ${cc} to ${selectedComponent.componentId}`);
      return;
    }

    const mapping = mappings.get(cc);
    if (mapping) {
      mapping.callback(value);
    }
  }

  public readonly startLearning = this.updater((state, mapping: Omit<MidiMapping, 'cc'>) => ({
    ...state,
    learningMode: true,
    selectedComponent: mapping,
  }));

  public readonly deleteMapping = this.updater((state, cc: number) => {
    const newMap = new Map(state.mappings);
    newMap.delete(cc);
    return {
      ...state,
      mappings: newMap,
    };
  });

  public readonly resetMappings = this.updater(state => ({
    ...state,
    mappings: new Map(),
  }));

  // Expose mappings as Observable if needed
  public readonly mappings$ = this.select(state => Array.from(state.mappings.values()));
}
