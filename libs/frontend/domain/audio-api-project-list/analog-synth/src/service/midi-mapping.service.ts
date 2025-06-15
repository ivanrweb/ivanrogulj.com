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
  selectedComponent: MidiMapping | null;
}

@Injectable({ providedIn: 'root' })
export class MidiMappingStore extends ComponentStore<MidiMappingState> {
  readonly mappings$ = this.select(state => state.mappings);
  readonly learningMode$ = this.select(state => state.learningMode);
  readonly selectedComponent$ = this.select(state => state.selectedComponent);

  private midiAccess: WebMidi.MIDIAccess | null = null;

  constructor() {
    super({
      mappings: new Map<number, MidiMapping>(),
      learningMode: false,
      selectedComponent: null,
    });

    this.initMIDI();
  }

  // 🔹 INIT MIDI
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

  // 🔹 HANDLING MIDI MESSAGES
  private handleMIDIMessage(event: WebMidi.MIDIMessageEvent): void {
    const [status, cc, value] = event.data;
    if (status !== 0xB0) return;

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

  // 🔹 PUBLIC API

  public readonly startLearning = this.updater((state, mapping: Omit<MidiMapping, 'cc'>) => ({
    ...state,
    learningMode: true,
    selectedComponent: { ...mapping, cc: -1 },
  }));

  public readonly deleteMapping = this.updater((state, cc: number) => {
    const newMap = new Map(state.mappings);
    newMap.delete(cc);
    return { ...state, mappings: newMap };
  });

  public readonly resetMappings = this.updater(state => ({
    ...state,
    mappings: new Map(),
  }));
}
