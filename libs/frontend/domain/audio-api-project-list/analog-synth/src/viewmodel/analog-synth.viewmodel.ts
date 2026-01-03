import { ComponentStore } from '@ngrx/component-store';
import { Observable, tap } from 'rxjs';
import { ElementRef, inject, Injectable } from '@angular/core';
import { v7 as uuidv7 } from 'uuid';
import { AudioContextService } from '../service/audio-context.service';
import { MidiService } from '../service/midi.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { OscilloscopeService } from '../service/oscilloscope.service';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
import { SynthPatchApiService } from '@ivanrogulj.com/frontend/shared/data-access/api';
import { EffectsViewModel } from './effects.viewmodel';

export interface AnalogSynthState {
  voices: AnalogSynthApi.Voice[];
  selectedOscType: OscillatorType;
  oscillatorCount: number;
  detuneAmount: number;
  volumeEnvelope: AnalogSynthApi.ADSR;
  filterEnvelope: AnalogSynthApi.ADSR;
  filterEnvelopeAmount: number;
  masterGain: number;
  filterFrequency: number;
  filterResonance: number;
  isPromptOpen: boolean;
  learnMode: boolean;
  learnTarget: AnalogSynthApi.Knob | null;
  mappedParams: Record<string, boolean>;
}

@Injectable({ providedIn: 'root' })
export class AnalogSynthViewModel extends ComponentStore<AnalogSynthState> {
  public readonly vm$: Observable<AnalogSynthState> = this.select(
    (state) => state
  );

  private readonly audioContextService = inject(AudioContextService);
  private readonly midiService = inject(MidiService);
  private readonly oscilloscopeService = inject(OscilloscopeService);
  private readonly synthPatchApiService = inject(SynthPatchApiService);
  private readonly effectsViewmodel = inject(EffectsViewModel);
  private readonly paramControl$ = this.midiService.paramControl$;

  constructor() {
    super({
      voices: [],
      selectedOscType: 'sawtooth',
      oscillatorCount: 4,
      detuneAmount: 10,
      volumeEnvelope: { attack: 0.15, decay: 0.6, sustain: 0.8, release: 0.3 },
      filterEnvelope: { attack: 0.3, decay: 0, sustain: 0.05, release: 0 },
      filterEnvelopeAmount: 0.5,
      masterGain: 0.5,
      filterFrequency: 200,
      filterResonance: 1.0,
      isPromptOpen: false,
      learnMode: false,
      learnTarget: null,
      mappedParams: {},
    });

    this.midiService.noteOn$.subscribe(({ note, velocity }) => {
      if (this.get().voices.some((v) => v.note === note)) return;
      const frequency = this.midiService.getFrequency(note);
      const adjustedVelocity =
        this.midiService.getVelocityBetweenZeroAndOne(velocity);
      this.createAndStartVoice(note, frequency, adjustedVelocity);
    });

    this.midiService.noteOff$.subscribe(({ note }) => {
      const voice = this.get().voices.find((v) => v.note === note);
      if (voice) {
        this.stopVoice(voice.id);
      }
    });

    this.midiService.mappingChanged$
      .pipe(
        tap((param) => {
          this.patchState((state) => ({
            mappedParams: { ...state.mappedParams, [param]: true },
          }));
        })
      )
      .subscribe();

    this.effect(
      (
        paramControl$: Observable<{ param: AnalogSynthApi.Knob; value: number }>
      ) =>
        paramControl$.pipe(
          tap(({ param, value }) => {
            const { learnMode, learnTarget } = this.get();
            if (learnMode && learnTarget) {
              this.midiService.mapControlToParam(param);
              this.disableMidiLearn();
            } else {
              if (param === AnalogSynthApi.Knob.MASTER_GAIN) {
                this.updateGain(value);
              } else if (param === AnalogSynthApi.Knob.FILTER_FREQUENCY) {
                const freq =
                  this.audioContextService.normalizedToFrequency(value);
                this.updateFilterFrequency(freq);
              } else if (param === AnalogSynthApi.Knob.FILTER_RESONANCE) {
                // (value is between 0-1) Resonance usually goes from 0 to 20 or 30 for biquad filter
                const resonance = value * 20;
                this.updateFilterResonance(resonance);
              } else if (param === AnalogSynthApi.Knob.DISTORTION_AMOUNT) {
                this.effectsViewmodel.updateDistortionAmount(value);
              } else if (param === AnalogSynthApi.Knob.REVERB_MIX) {
                this.effectsViewmodel.updateReverbMix(value);
              } else if (param === AnalogSynthApi.Knob.REVERB_DECAY) {
                // Mapping 0-1 0.1s-5s
                this.effectsViewmodel.updateReverbDecay(0.1 + value * 4.9);
              } else if (param === AnalogSynthApi.Knob.DELAY_TIME) {
                this.effectsViewmodel.updateDelayTime(value); // 0-1s
              } else if (param === AnalogSynthApi.Knob.DELAY_FEEDBACK) {
                this.effectsViewmodel.updateDelayFeedback(value * 0.9); // Max 0.9 to reduce microphonia
              } else if (param === AnalogSynthApi.Knob.DELAY_MIX) {
                this.effectsViewmodel.updateDelayMix(value);
              }
              // --- FILTER ENVELOPE ---
              else if (param === AnalogSynthApi.Knob.FILTER_ATTACK) {
                this.updateFilterEnvelope({ attack: value });
              } else if (param === AnalogSynthApi.Knob.FILTER_DECAY) {
                this.updateFilterEnvelope({ decay: value });
              } else if (param === AnalogSynthApi.Knob.FILTER_SUSTAIN) {
                this.updateFilterEnvelope({ sustain: value });
              } else if (param === AnalogSynthApi.Knob.FILTER_RELEASE) {
                this.updateFilterEnvelope({ release: value });
              }
              // --- VOLUME ENVELOPE ---
              else if (param === AnalogSynthApi.Knob.ATTACK) {
                this.updateVolumeEnvelope({ attack: value });
              } else if (param === AnalogSynthApi.Knob.DECAY) {
                this.updateVolumeEnvelope({ decay: value });
              } else if (param === AnalogSynthApi.Knob.SUSTAIN) {
                this.updateVolumeEnvelope({ sustain: value });
              } else if (param === AnalogSynthApi.Knob.RELEASE) {
                this.updateVolumeEnvelope({ release: value });
              }
              // Safety check
              else {
                console.warn('Unhandled param:', param);
              }
            }
          })
        )
    )(this.paramControl$);
  }

  public startAudioContext(): void {
    this.audioContextService.initializeAudioNodes();

    //now, when nodes exist, tell the effects to apply values from the effects viewmodel
    this.effectsViewmodel.refreshState();
  }

  public destroyAudioContext(): void {
    this.audioContextService.destroyContext();
  }

  // Incorporates each voice's individual velocity
  private updateAllVoiceLevels(): void {
    const { voices } = this.get();
    const totalVoices = voices.length;
    if (totalVoices === 0) return;

    const compensationFactor = Math.sqrt(totalVoices);
    let baseTargetGain = 1.0 / compensationFactor;

    //Reduce perceived volume when only 1 voice is active
    if (totalVoices === 1) {
      baseTargetGain *= 0.4;
    }

    voices.forEach((voice) => {
      // The lower the exponent, the louder will low-velocity keys be
      const velocityFactor = Math.pow(voice.velocity, 1.2);
      // The final gain for this voice is the base gain modulated by its velocity
      const finalTargetGain = baseTargetGain * velocityFactor;

      voice.levelGainNode.gain.setTargetAtTime(
        finalTargetGain,
        this.audioContextService.currentTime,
        0.015
      );
    });
  }

  public createAndStartVoice(
    note: number,
    frequency: number,
    velocity: number
  ): void {
    const {
      selectedOscType,
      volumeEnvelope,
      filterEnvelope,
      filterFrequency,
      filterEnvelopeAmount,
      filterResonance,
      oscillatorCount,
      detuneAmount,
    } = this.get();

    const voiceId = uuidv7();
    const filterNode = this.audioContextService.createFilter();
    filterNode.Q.value = filterResonance;

    const adsrGainNode = this.audioContextService.createGain();
    const levelGainNode = this.audioContextService.createGain();

    const oscNodes: OscillatorNode[] = [];

    // Create number of oscillators dynamically in a voice (based on oscillatorCount)
    for (let i = 0; i < oscillatorCount; i++) {
      const osc = this.audioContextService.createOsc(
        selectedOscType,
        frequency
      );

      // Math for Detune:
      // If we have 3 oscillators, and detuneAmount is 20:
      // i=0 -> -20, i=1 -> 0, i=2 -> +20
      if (oscillatorCount > 1) {
        const spread = (i / (oscillatorCount - 1) - 0.5) * 2; // Span from -1 to 1
        osc.detune.value = spread * detuneAmount;
      } else {
        osc.detune.value = 0; // Only 1 oscillator is perfectly pitched
      }

      osc.connect(filterNode);
      osc.start();
      oscNodes.push(osc);
    }

    this.audioContextService.applyVolumeEnvelope(adsrGainNode, volumeEnvelope);
    this.audioContextService.applyFilterEnvelope(
      filterNode,
      filterEnvelope,
      filterFrequency,
      filterEnvelopeAmount
    );

    this.audioContextService.connectVoiceNodes(
      filterNode,
      adsrGainNode,
      levelGainNode
    );

    const newVoice: AnalogSynthApi.Voice = {
      id: voiceId,
      note,
      velocity,
      oscNodes,
      filterNode,
      adsrGainNode,
      levelGainNode,
    };

    this.patchState((state) => ({ voices: [...state.voices, newVoice] }));
    this.updateAllVoiceLevels();
  }

  private releaseVoice(voice: AnalogSynthApi.Voice): void {
    const { volumeEnvelope, filterEnvelope } = this.get();

    // Ensure release times are never zero to prevent clicks
    const safeVolumeRelease = Math.max(0.005, volumeEnvelope.release);
    const safeFilterRelease = Math.max(0.005, filterEnvelope.release);

    this.audioContextService.releaseVolumeEnvelope(
      voice.adsrGainNode,
      safeVolumeRelease
    );
    this.audioContextService.releaseFilterEnvelope(
      voice.filterNode,
      safeFilterRelease
    );

    const maxReleaseTime = Math.max(safeVolumeRelease, safeFilterRelease);

    setTimeout(() => {
      this.audioContextService.stopAndDisconnectVoice(
        voice.oscNodes,
        voice.filterNode,
        voice.adsrGainNode,
        voice.levelGainNode
      );
    }, maxReleaseTime * 1000);
  }

  public stopVoice(voiceId: string): void {
    const voiceToStop = this.get().voices.find((v) => v.id === voiceId);
    if (voiceToStop) {
      this.releaseVoice(voiceToStop);
      this.patchState((state) => ({
        voices: state.voices.filter((v) => v.id !== voiceId),
      }));
      this.updateAllVoiceLevels();
    }
  }

  public updateGain(gainValue: number): void {
    if (typeof gainValue !== 'number' || !isFinite(gainValue)) return;
    this.patchState({ masterGain: gainValue });
    this.audioContextService.setMasterGain(gainValue);
  }

  public updateFilterFrequency(frequency: number): void {
    if (typeof frequency !== 'number' || !isFinite(frequency)) return;

    this.patchState({ filterFrequency: frequency });

    // For all existing notes, directly set filter frequency for immediate audio response
    this.get().voices.forEach((voice) => {
      this.audioContextService.setFilterFrequency(voice.filterNode, frequency);
    });
  }

  public updateFilterEnvelope(partial: Partial<AnalogSynthApi.ADSR>): void {
    this.patchState((state) => ({
      filterEnvelope: { ...state.filterEnvelope, ...partial },
    }));
  }

  //how much percentage will (0-100)
  public updateFilterEnvelopeAmount(amount: number): void {
    if (typeof amount !== 'number' || !isFinite(amount)) return;
    this.patchState({ filterEnvelopeAmount: amount });

    // When envelop amount is changed, retrigger envelope for all active voices so that change is registered.
    const { voices, filterEnvelope, filterFrequency } = this.get();
    voices.forEach((voice) => {
      this.audioContextService.applyFilterEnvelope(
        voice.filterNode,
        filterEnvelope,
        filterFrequency,
        amount
      );
    });
  }

  public updateFilterResonance(resonance: number): void {
    if (typeof resonance !== 'number' || !isFinite(resonance)) return;
    this.patchState({ filterResonance: resonance });
    this.get().voices.forEach((voice) => {
      voice.filterNode.Q.setTargetAtTime(
        resonance,
        this.audioContextService.currentTime,
        0.01
      );
    });
  }

  public updateVolumeEnvelope(partial: Partial<AnalogSynthApi.ADSR>): void {
    this.patchState((state) => ({
      volumeEnvelope: { ...state.volumeEnvelope, ...partial },
    }));
  }

  public onOscillatorTypeChange(selectedValue: OscillatorType): void {
    this.patchState({ selectedOscType: selectedValue });
  }

  public initializeOscilloscope(canvas: ElementRef<HTMLCanvasElement>): void {
    const analyserNode = this.audioContextService.getAnalyserNode();
    this.oscilloscopeService.draw(analyserNode, canvas.nativeElement);
  }

  public generateAIPatch(patchDescription: string): void {
    this.synthPatchApiService
      .generateAIPatch(patchDescription)
      .subscribe((synthPatch) => {
        this.patchState({ volumeEnvelope: this.mapToADSR(synthPatch) });
      });
  }

  public mapToADSR(synthPatch: AnalogSynthApi.SynthPatch): AnalogSynthApi.ADSR {
    return {
      attack: synthPatch.attack,
      decay: synthPatch.decay,
      sustain: synthPatch.sustain,
      release: synthPatch.release,
    };
  }

  public togglePrompt(): void {
    this.patchState({ isPromptOpen: !this.get().isPromptOpen });
  }

  public disableMidiLearn(): void {
    this.patchState({
      learnMode: false,
      learnTarget: null,
    });
  }

  public toggleMidiLearn(): void {
    const { learnMode, learnTarget } = this.get();
    this.patchState({
      learnMode: !learnMode,
      learnTarget: !learnMode ? learnTarget : null,
    });
  }

  public startLearning(param: AnalogSynthApi.Knob): void {
    console.log('midi mapping for: ', param);
    this.patchState({ learnTarget: param });
    this.midiService.startMapping(param);
  }
}
