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
import { LfoViewModel } from './lfo.viewmodel';
import { LfoService } from '../service/lfo.service';

export interface AnalogSynthState {
  voices: AnalogSynthApi.Voice[];
  selectedOscType: OscillatorType;
  oscillatorCount: number;
  detuneOscillatorsAmount: number;
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
  noiseType: 'white' | 'pink' | 'brown';
  noiseVolume: number;
  isPolyphonic: boolean;
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
  private readonly lfoViewModel = inject(LfoViewModel);
  private readonly lfoService = inject(LfoService);
  private readonly paramControl$ = this.midiService.paramControl$;

  constructor() {
    super({
      voices: [],
      selectedOscType: 'sawtooth',
      oscillatorCount: 2,
      detuneOscillatorsAmount: 0,
      volumeEnvelope: {
        attack: 0.15,
        decay: 0.6,
        sustain: 0.8,
        release: 0.005,
      },
      filterEnvelope: { attack: 0.3, decay: 0, sustain: 0.05, release: 0.02 },
      filterEnvelopeAmount: 0.5,
      masterGain: 0.5,
      filterFrequency: 2000,
      filterResonance: 1.0,
      isPromptOpen: false,
      learnMode: false,
      learnTarget: null,
      mappedParams: {},
      noiseType: 'brown',
      noiseVolume: 0,
      isPolyphonic: true,
    });

    this.midiService.noteOn$.subscribe(({ note, velocity }) => {
      if (this.get().voices.some((v) => v.note === note)) return;
      const frequency = this.midiService.getFrequency(note);
      const adjustedVelocity =
        this.midiService.getVelocityBetweenZeroAndOne(velocity);
      this.createAndStartVoice(note, frequency, adjustedVelocity);
      const { lfo1, lfo2 } = this.lfoViewModel.getState();
      if (lfo1.keySync) this.lfoService.keySync(0);
      if (lfo2.keySync) this.lfoService.keySync(1);
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
              } else if (
                param === AnalogSynthApi.Knob.DETUNE_OSCILLATORS_AMOUNT
              ) {
                // MIDI sends 0-1, we want 0-100
                this.updateDetuneOscillatorsAmount(value * 100);
              } else if (param === AnalogSynthApi.Knob.FILTER_FREQUENCY) {
                const freq =
                  this.audioContextService.normalizedToFrequency(value);
                this.updateFilterFrequency(freq);
              } else if (param === AnalogSynthApi.Knob.FILTER_RESONANCE) {
                // (value is between 0-1) Resonance usually goes from 0 to 20 or 30 for biquad filter
                const resonance = value * 20;
                this.updateFilterResonance(resonance);
              } else if (param === AnalogSynthApi.Knob.FILTER_ENVELOPE_AMOUNT) {
                // Method expects value between 0 and 1
                this.updateFilterEnvelopeAmount(value);
              } else if (param === AnalogSynthApi.Knob.DISTORTION_AMOUNT) {
                this.effectsViewmodel.updateDistortionAmount(value);
              } else if (param === AnalogSynthApi.Knob.REVERB_MIX) {
                this.effectsViewmodel.updateReverbMix(value);
              } else if (param === AnalogSynthApi.Knob.REVERB_DECAY) {
                // Mapping 0-1 0.1s-5s
                this.effectsViewmodel.updateReverbDecay(0.1 + value * 9.9);
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
              // --- LFO ---
              else if (param === AnalogSynthApi.Knob.LFO1_RATE) {
                this.lfoViewModel.updateLfo1({ rate: value * 20 }); // 0-1 → 0-20 Hz
              } else if (param === AnalogSynthApi.Knob.LFO1_DEPTH) {
                this.lfoViewModel.updateLfo1({ depth: value });
              } else if (param === AnalogSynthApi.Knob.LFO2_RATE) {
                this.lfoViewModel.updateLfo2({ rate: value * 20 });
              } else if (param === AnalogSynthApi.Knob.LFO2_DEPTH) {
                this.lfoViewModel.updateLfo2({ depth: value });
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
    this.lfoService.initialize();
  }

  public destroyAudioContext(): void {
    this.audioContextService.destroyContext();
  }

  // Incorporates each voice's individual velocity
  private updateAllVoiceLevels(): void {
    const { voices, oscillatorCount, detuneOscillatorsAmount } = this.get();
    const totalVoices = voices.length;
    if (totalVoices === 0) return;

    // Calculate oscillator scaling factor based on phase coherence (detune).
    // Detune 0 implies coherent phases (constructive interference), requiring linear scaling.
    // Higher detune implies incoherent phases, allowing for square root scaling (power addition).
    const detuneSaturation = 30;
    const detuneFactor = Math.min(
      detuneOscillatorsAmount / detuneSaturation,
      1.0
    );

    const coherentScale = oscillatorCount; // All in phase (Detune 0) - worst case scenario, needs more gain reduction
    const incoherentScale = Math.sqrt(oscillatorCount); // Detuned - best case scenario, needs less gain reduction

    // Interpolate between coherent and incoherent scaling based on detune amount
    const currentOscScale =
      coherentScale * (1 - detuneFactor) + incoherentScale * detuneFactor;

    // Leave 20% od space for filter resonance, effects, etc. before it comes to distortion
    let baseHeadroom = 0.8;

    //sine has higher peak when oscillators are in tune than others
    const selectedOscType = this.get().selectedOscType;
    if (selectedOscType === 'sine') {
      baseHeadroom = 0.6;
    }

    const compensationFactor = Math.sqrt(totalVoices) * currentOscScale;
    let baseTargetGain = baseHeadroom / compensationFactor;

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
        0.02
      );
    });
  }

  public createAndStartVoice(
    note: number,
    frequency: number,
    velocity: number
  ): void {
    if (!this.get().isPolyphonic) {
      // If in Mono mode, turn off all current oscillators
      this.get().voices.forEach((v) => this.stopVoice(v.id));
    }

    const {
      selectedOscType,
      volumeEnvelope,
      filterEnvelope,
      filterFrequency,
      filterEnvelopeAmount,
      filterResonance,
      oscillatorCount,
      detuneOscillatorsAmount,
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
      osc.detune.value = this.calculateDetuneSpread(
        i,
        oscillatorCount,
        detuneOscillatorsAmount
      );

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
    this.lfoService.connectToVoice(newVoice);
    this.updateAllVoiceLevels();
  }

  private releaseVoice(voice: AnalogSynthApi.Voice): void {
    const { volumeEnvelope, filterEnvelope } = this.get();

    // Ensure release times are never zero to prevent clicks
    const safeVolumeRelease = Math.max(0.005, volumeEnvelope.release);
    const safeFilterRelease = Math.max(0.02, filterEnvelope.release);

    this.audioContextService.releaseVolumeEnvelope(
      voice.adsrGainNode,
      safeVolumeRelease
    );
    this.audioContextService.releaseFilterEnvelope(
      voice.filterNode,
      safeFilterRelease
    );

    const maxReleaseTime = Math.max(safeVolumeRelease, safeFilterRelease);

    this.lfoService.disconnectFromVoice(voice);

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

  public togglePolyphony(): void {
    this.patchState((state) => ({ isPolyphonic: !state.isPolyphonic }));
  }

  public updateGain(gainValue: number): void {
    if (typeof gainValue !== 'number' || !isFinite(gainValue)) return;
    this.patchState({ masterGain: gainValue });
    this.audioContextService.setMasterGain(gainValue);
  }

  public updateNoiseVolume(volume: number): void {
    this.patchState({ noiseVolume: volume });
    this.audioContextService.setNoiseGain(volume);
  }

  public updateNoiseType(type: 'white' | 'pink' | 'brown'): void {
    this.patchState({ noiseType: type });
    this.audioContextService.setNoiseType(type);
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

  public generateAIPatch(patchDescription: string, provider: 'openai' | 'anthropic' = 'openai'): void {
    this.synthPatchApiService
      .generateAIPatch(patchDescription, provider)
      .subscribe((patch) => {
        // Oscillator
        this.onOscillatorTypeChange(patch.oscillator.type as OscillatorType);
        this.updateOscillatorCount(patch.oscillator.count);
        // Detune: JSON 0-1 → state in cents (0-100)
        this.updateDetuneOscillatorsAmount(patch.oscillator.detune * 100);
        this.patchState({ isPolyphonic: patch.oscillator.isPolyphonic });
        this.updateNoiseType(patch.oscillator.noiseType as 'white' | 'pink' | 'brown');
        this.updateNoiseVolume(patch.oscillator.noiseVolume);

        // Master
        this.updateGain(patch.master.gain);

        // Filter: frequency JSON 0-1 → Hz (20-20000); resonance 0-1 → Q (0.1-10)
        this.updateFilterFrequency(20 + patch.filter.frequency * 19980);
        this.updateFilterResonance(0.1 + patch.filter.resonance * 9.9);
        this.updateFilterEnvelopeAmount(patch.filter.envelopeAmount);

        // Envelopes (0-1 direct)
        this.updateVolumeEnvelope(patch.volumeEnvelope);
        this.updateFilterEnvelope(patch.filterEnvelope);

        // Effects — reverb.decay JSON 0-1 → seconds (0.1-10); delay.feedback capped at 0.9
        this.effectsViewmodel.patchState({
          distortion: {
            amount: patch.effects.distortion.amount,
            tone: patch.effects.distortion.tone,
            mix: patch.effects.distortion.mix,
            enabled: patch.effects.distortion.enabled,
          },
          chorus: {
            rate: patch.effects.chorus.rate,
            depth: patch.effects.chorus.depth,
            mix: patch.effects.chorus.mix,
            enabled: patch.effects.chorus.enabled,
          },
          reverb: {
            mix: patch.effects.reverb.mix,
            decay: 0.1 + patch.effects.reverb.decay * 9.9,
            enabled: patch.effects.reverb.enabled,
          },
          delay: {
            time: patch.effects.delay.time,
            feedback: patch.effects.delay.feedback * 0.9,
            mix: patch.effects.delay.mix,
            enabled: patch.effects.delay.enabled,
          },
        });

        // LFOs: rate JSON 0-1 → Hz (0-20)
        this.lfoViewModel.updateLfo1({
          rate: patch.lfo1.rate * 20,
          depth: patch.lfo1.depth,
          waveform: patch.lfo1.waveform as OscillatorType,
          destination: patch.lfo1.destination as AnalogSynthApi.LfoDestination,
          keySync: patch.lfo1.keySync,
          enabled: patch.lfo1.enabled,
        });
        this.lfoViewModel.updateLfo2({
          rate: patch.lfo2.rate * 20,
          depth: patch.lfo2.depth,
          waveform: patch.lfo2.waveform as OscillatorType,
          destination: patch.lfo2.destination as AnalogSynthApi.LfoDestination,
          keySync: patch.lfo2.keySync,
          enabled: patch.lfo2.enabled,
        });
      });
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

  public unmapParam(param: AnalogSynthApi.Knob): void {
    this.midiService.unmapParam(param);
    this.patchState((state) => {
      const mappedParams = { ...state.mappedParams };
      delete mappedParams[param];
      return { mappedParams };
    });
  }

  public startLearning(param: AnalogSynthApi.Knob): void {
    console.log('midi mapping for: ', param);
    this.patchState({ learnTarget: param });
    this.midiService.startMapping(param);
  }

  public updateOscillatorCount(count: number): void {
    this.patchState({ oscillatorCount: Number(count) });
  }

  public updateDetuneOscillatorsAmount(amount: number): void {
    // 1. Update state
    this.patchState({ detuneOscillatorsAmount: amount });

    // 2. Get current voices and settings
    const { voices, oscillatorCount } = this.get();
    const now = this.audioContextService.currentTime;

    // 3. Go through every active voice
    voices.forEach((voice) => {
      // Every voice has multiple oscillators (ex. 4)
      voice.oscNodes.forEach((osc, i) => {
        const detuneValue = this.calculateDetuneSpread(
          i,
          oscillatorCount,
          amount
        );

        // 4. Set new value smoothly (without audio clicks/pops)
        osc.detune.setTargetAtTime(detuneValue, now, 0.01); // 10ms smoothing
      });
    });
  }

  /**
   * Calculates the detune value for a specific oscillator index to create a symmetrical spread.
   *
   * Formula breakdown: `(i / (count - 1) - 0.5) * 2`
   * 1. `i / (count - 1)`: Normalizes the index to a [0, 1] range.
   * 2. `- 0.5`: Shifts the range to [-0.5, 0.5] to center it around the root pitch.
   * 3. `* 2`: Scales it to [-1, 1] so the first oscillator is fully flat and the last is fully sharp.
   *
   * @param index - The index of the current oscillator (0 to total-1).
   * @param totalOscillators - Total number of active oscillators.
   * @param amount - The maximum detune amount in cents.
   */
  private calculateDetuneSpread(
    index: number,
    totalOscillators: number,
    amount: number
  ): number {
    if (totalOscillators <= 1) {
      return 0; // Single oscillator is always perfectly tuned
    }
    const spreadFactor = (index / (totalOscillators - 1) - 0.5) * 2;
    return spreadFactor * amount;
  }

  public getState(): AnalogSynthState {
    return this.get();
  }

  public triggerNoteOn(note: number, velocity: number): void {
    if (this.get().voices.some((v) => v.note === note)) return;
    const frequency = this.midiService.getFrequency(note);
    const adjustedVelocity = this.midiService.getVelocityBetweenZeroAndOne(velocity);
    this.createAndStartVoice(note, frequency, adjustedVelocity);
    const { lfo1, lfo2 } = this.lfoViewModel.getState();
    if (lfo1.keySync) this.lfoService.keySync(0);
    if (lfo2.keySync) this.lfoService.keySync(1);
  }

  public triggerNoteOff(note: number): void {
    const voice = this.get().voices.find((v) => v.note === note);
    if (voice) {
      this.stopVoice(voice.id);
    }
  }
}
