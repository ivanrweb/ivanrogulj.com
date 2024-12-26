import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { ElementRef, Injectable } from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Oscillator } from '@ivanrogulj.com/oscillator';
import { v7 as uuidv7 } from 'uuid';
import { AudioContextService } from '../service/audio-context.service';
import { MidiService } from '../service/midi.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ADSR, Gain } from '@ivanrogulj.com/gain';
import { OscilloscopeService } from '../service/oscilloscope.service';
import {
  SynthPatchApiService
} from '../../../../../shared/data-access/api/src/lib/analog-synth/synth-patch-api.service';

export interface AnalogSynthState {
  oscillators: Oscillator[];
  selectedOscType: OscillatorType;
  volumeEnvelope: ADSR;
  gains: Gain[];
  masterGain: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalogSynthViewModel extends ComponentStore<AnalogSynthState> {
  public readonly vm$: Observable<AnalogSynthState> = this.select(state => ({
    oscillators: state.oscillators,
    selectedOscType: state.selectedOscType,
    volumeEnvelope: state.volumeEnvelope,
    gains: state.gains,
    masterGain: state.masterGain,
  }));

  private midiNoteToVoiceMap = new Map<number, string>(); // Maps MIDI note to oscillator ID

  constructor(private readonly audioContextService: AudioContextService,
              private readonly midiService: MidiService,
              private readonly oscilloscopeService: OscilloscopeService,
              private readonly synthPatchApiService: SynthPatchApiService) {
    super({
      oscillators: [],
      selectedOscType: 'sawtooth',
      volumeEnvelope: {
        attack: 0.05,
        decay: 0.6,
        sustain: 0.8,
        release: 0.3
      },
      gains: [],
      masterGain: 0.2
    });

    //Note on event
    this.midiService.noteOn$.subscribe(({ note, velocity }) => {
      const frequency = this.midiService.getFrequency(note);
      const adjustedVelocity = this.midiService.getVelocityBetweenZeroAndOne(velocity);
      const voice = this.createAndStartVoice(frequency, adjustedVelocity);
      this.midiNoteToVoiceMap.set(note, voice.id);
    });

    //Note off event
    this.midiService.noteOff$.subscribe(({ note }) => {
      const oscId = this.midiNoteToVoiceMap.get(note);
      if (oscId) {
        this.stopOscillator(oscId);
        this.midiNoteToVoiceMap.delete(note);
      }
    });
  }

  public startAudioContext(): void {
    this.audioContextService.initializeAudioNodes();
  }

  public destroyAudioContext(): void {
    this.audioContextService.destroyContext();
  }

  public createAndStartVoice(frequency: number, keyVelocity: number): Oscillator {
    const oscNode = this.audioContextService.createOsc(this.get().selectedOscType, frequency);
    const gainNode = this.audioContextService.createGain();
    const oscId = uuidv7(); // Unique ID for the oscillator

    const newOsc: Oscillator = {
      id: oscId,
      type: oscNode.type,
      frequency: oscNode.frequency.value,
      detune: oscNode.detune.value,
      node: oscNode
    };

    this.audioContextService.updateVolumeEnvelope(gainNode, this.get().volumeEnvelope);
    this.audioContextService.startOsc(oscNode);

    //Update oscillators and gains states
    this.patchState((state) => ({
      oscillators: [...state.oscillators, newOsc],
      gains: [...state.gains, { id: oscId, gainNode }]
    }));

    this.recalculateMasterGain(keyVelocity);
    this.audioContextService.connectNodes(oscNode, gainNode);

    return newOsc; // Return the oscillator object
  }

  private recalculateMasterGain(keyVelocity?: number): void {
    const totalOscillators = this.get().oscillators.length;

    //TODO: delete later (value between 0 and 1) - while this line exists, key velocity is the same for all notes playing
    keyVelocity = 0.7;

    //1. square root scaling for every new oscillator to make total output gain quieter when multiple oscillators
    //const normalizedGain = totalOscillators > 0 ? this.get().masterGain / Math.sqrt(totalOscillators) : this.get().masterGain;
    //2. pow technique for the same thing, a little bit quieter on polyphony than square root scaling approach
    const normalizedGain = totalOscillators > 0 ? this.get().masterGain / Math.pow(totalOscillators, 0.8) : this.get().masterGain;

    // Apply a quadratic easing function (adjust so that total is max 1 when combined)
    const scaledVelocity = keyVelocity ? (0.15 + 0.35 * keyVelocity + 0.5 * Math.pow(keyVelocity, 2)) : 1;

    // Adjust gain based on the key velocity (if it exists). If not, just return gain
    const finalGain = keyVelocity ? normalizedGain * scaledVelocity : normalizedGain;

    this.audioContextService.setMasterGain(finalGain);
  }

  private releaseOscillator(oscillator: Oscillator): void {
    const gainNodeEntry = this.get().gains.find(entry => entry.id === oscillator.id);

    if (gainNodeEntry) {
      this.audioContextService.releaseVolumeEnvelope(gainNodeEntry.gainNode, this.get().volumeEnvelope.release);

      setTimeout(() => {
        this.audioContextService.stopAndDisconnectSound(oscillator.node, gainNodeEntry.gainNode);
        this.patchState((state) => ({
          gains: state.gains.filter(entry => entry.id !== oscillator.id)
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
        oscillators: updatedOscillators
      };
    });
  }

  public updateFilter(frequency: number): void {
    this.audioContextService.updateFilter(frequency);
  }

  public updateGain(gainValue: number): void {
    this.patchState({ masterGain: gainValue });

    this.recalculateMasterGain();
  }

  public updateVolumeEnvelope(partial: Partial<ADSR>): void {
    this.patchState((state) => ({
      volumeEnvelope: {
        ...state.volumeEnvelope,
        ...partial
      }
    }));

    //in case you need to update all gains, not only the latest one
    // this.get().gains.forEach(({ gainNode }) => {
    //   this.audioContextService.updateVolumeEnvelope(gainNode, this.get().volumeEnvelope);
    // });

    if(this.get().gains.length) {
      const lastGainNode = this.get().gains[this.get().gains.length - 1].gainNode;
      this.audioContextService.updateVolumeEnvelope(lastGainNode, this.get().volumeEnvelope);
    }
  }

  public onOscillatorTypeChange(event$: Event): void {
    const selectElement = event$.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    this.patchState({ selectedOscType: selectedValue as OscillatorType });
  }

  // Method to start the oscilloscope visualization
  public initializeOscilloscope(canvas: ElementRef<HTMLCanvasElement>): void {
    const analyserNode = this.audioContextService.getAnalyserNode();
    this.oscilloscopeService.draw(analyserNode, canvas.nativeElement);
  }


  //TODO: this is just a test, this should be in a separate viewmodel
  public generateNewPatchAI(patchDescription: string): void {
    this.synthPatchApiService.generateAIPatch(patchDescription).subscribe();
  }
}
