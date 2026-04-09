import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AuthService } from '@ivanrogulj.com/auth';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { SynthPatchApiService } from '@ivanrogulj.com/frontend/shared/data-access/api';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
import { AnalogSynthViewModel } from '../viewmodel/analog-synth.viewmodel';
import { EffectsViewModel } from '../viewmodel/effects.viewmodel';
import { LfoViewModel } from '../viewmodel/lfo.viewmodel';
import { SequencerViewModel } from '../viewmodel/sequencer.viewmodel';

export interface PatchSummary {
  id: string;
  name: string;
  isPublic: boolean;
  createdAt: string;
}

export interface SavePresetResult {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class PatchApiService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly synthPatchApiService = inject(SynthPatchApiService);
  private readonly analogSynthViewModel = inject(AnalogSynthViewModel);
  private readonly effectsViewModel = inject(EffectsViewModel);
  private readonly lfoViewModel = inject(LfoViewModel);
  private readonly sequencerViewModel = inject(SequencerViewModel);

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  public savePreset(name: string, isPublic: boolean): Observable<SavePresetResult> {
    const synth = this.analogSynthViewModel.getState();
    const effects = this.effectsViewModel.getState();
    const lfo = this.lfoViewModel.getState();
    const seq = this.sequencerViewModel.getState();

    const body = {
      name,
      isPublic,

      // Oscillator / main
      oscType: synth.selectedOscType,
      oscillatorCount: synth.oscillatorCount,
      detuneAmount: synth.detuneOscillatorsAmount,
      isPolyphonic: synth.isPolyphonic,
      noiseType: synth.noiseType,
      noiseVolume: synth.noiseVolume,
      masterGain: synth.masterGain,

      // Filter
      filterFrequency: synth.filterFrequency,
      filterResonance: synth.filterResonance,
      filterEnvelopeAmount: synth.filterEnvelopeAmount,

      // Volume envelope
      volAttack: synth.volumeEnvelope.attack,
      volDecay: synth.volumeEnvelope.decay,
      volSustain: synth.volumeEnvelope.sustain,
      volRelease: synth.volumeEnvelope.release,

      // Filter envelope
      filterAttack: synth.filterEnvelope.attack,
      filterDecay: synth.filterEnvelope.decay,
      filterSustain: synth.filterEnvelope.sustain,
      filterRelease: synth.filterEnvelope.release,

      // LFOs
      lfo1: {
        rate: lfo.lfo1.rate,
        depth: lfo.lfo1.depth,
        waveform: lfo.lfo1.waveform,
        destination: lfo.lfo1.destination,
        keySync: lfo.lfo1.keySync,
        enabled: lfo.lfo1.enabled,
      },
      lfo2: {
        rate: lfo.lfo2.rate,
        depth: lfo.lfo2.depth,
        waveform: lfo.lfo2.waveform,
        destination: lfo.lfo2.destination,
        keySync: lfo.lfo2.keySync,
        enabled: lfo.lfo2.enabled,
      },

      // Sequencer
      bpm: seq.bpm,
      rowCount: seq.rowCount,
      steps: seq.steps.map((s) => ({
        active: s.active,
        note: s.note,
        velocity: s.velocity,
      })),

      // Effects — distortion
      distortionAmount: effects.distortion.amount,
      distortionTone: effects.distortion.tone,
      distortionMix: effects.distortion.mix,
      distortionEnabled: effects.distortion.enabled,

      // Effects — chorus
      chorusRate: effects.chorus.rate,
      chorusDepth: effects.chorus.depth,
      chorusMix: effects.chorus.mix,
      chorusEnabled: effects.chorus.enabled,

      // Effects — reverb
      reverbMix: effects.reverb.mix,
      reverbDecay: effects.reverb.decay,
      reverbEnabled: effects.reverb.enabled,

      // Effects — delay
      delayTime: effects.delay.time,
      delayFeedback: effects.delay.feedback,
      delayMix: effects.delay.mix,
      delayEnabled: effects.delay.enabled,
    };

    return this.http.post<SavePresetResult>('/api/patches', body, {
      headers: this.getAuthHeaders(),
    });
  }

  public getMyPresets(): Observable<PatchSummary[]> {
    return this.http.get<PatchSummary[]>('/api/patches/my', {
      headers: this.getAuthHeaders(),
    });
  }

  public loadPreset(id: string): Observable<void> {
    interface FullPatchResponse {
      patch: {
        oscType: OscillatorType;
        oscillatorCount: number;
        detuneAmount: number;
        isPolyphonic: boolean;
        noiseType: 'white' | 'pink' | 'brown';
        noiseVolume: number;
        masterGain: number;
        filterFrequency: number;
        filterResonance: number;
        filterEnvelopeAmount: number;
        volAttack: number;
        volDecay: number;
        volSustain: number;
        volRelease: number;
        filterAttack: number;
        filterDecay: number;
        filterSustain: number;
        filterRelease: number;
      };
      lfo1: { rate: number; depth: number; waveform: OscillatorType; destination: AnalogSynthApi.LfoDestination; keySync: boolean; enabled: boolean } | null;
      lfo2: { rate: number; depth: number; waveform: OscillatorType; destination: AnalogSynthApi.LfoDestination; keySync: boolean; enabled: boolean } | null;
      sequencer: { bpm: number; rowCount: number; steps: Array<{ active: boolean; note: number; velocity: number }> } | null;
      effects: {
        distortionAmount: number; distortionTone: number; distortionMix: number; distortionEnabled: boolean;
        chorusRate: number; chorusDepth: number; chorusMix: number; chorusEnabled: boolean;
        reverbMix: number; reverbDecay: number; reverbEnabled: boolean;
        delayTime: number; delayFeedback: number; delayMix: number; delayEnabled: boolean;
      } | null;
    }

    return this.http
      .get<FullPatchResponse>(`/api/patches/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        tap((res) => {
          const p = res.patch;

          // These setters update BOTH state AND audio nodes
          this.analogSynthViewModel.updateGain(p.masterGain);
          this.analogSynthViewModel.updateFilterFrequency(p.filterFrequency);
          this.analogSynthViewModel.updateFilterResonance(p.filterResonance);
          this.analogSynthViewModel.updateFilterEnvelopeAmount(p.filterEnvelopeAmount);
          this.analogSynthViewModel.updateNoiseVolume(p.noiseVolume);
          this.analogSynthViewModel.updateNoiseType(p.noiseType);
          this.analogSynthViewModel.updateDetuneOscillatorsAmount(p.detuneAmount);
          // These only update state (applied on next note trigger)
          this.analogSynthViewModel.onOscillatorTypeChange(p.oscType);
          this.analogSynthViewModel.updateOscillatorCount(p.oscillatorCount);
          this.analogSynthViewModel.patchState({ isPolyphonic: p.isPolyphonic });
          this.analogSynthViewModel.updateVolumeEnvelope({ attack: p.volAttack, decay: p.volDecay, sustain: p.volSustain, release: p.volRelease });
          this.analogSynthViewModel.updateFilterEnvelope({ attack: p.filterAttack, decay: p.filterDecay, sustain: p.filterSustain, release: p.filterRelease });

          // Effects — patchState triggers reactive sync to audio nodes
          if (res.effects) {
            const e = res.effects;
            this.effectsViewModel.patchState({
              distortion: { amount: e.distortionAmount, tone: e.distortionTone, mix: e.distortionMix, enabled: e.distortionEnabled },
              chorus: { rate: e.chorusRate, depth: e.chorusDepth, mix: e.chorusMix, enabled: e.chorusEnabled },
              reverb: { mix: e.reverbMix, decay: e.reverbDecay, enabled: e.reverbEnabled },
              delay: { time: e.delayTime, feedback: e.delayFeedback, mix: e.delayMix, enabled: e.delayEnabled },
            });
          }

          // LFOs — updateLfo1/2 trigger reactive sync to audio nodes
          if (res.lfo1) this.lfoViewModel.updateLfo1(res.lfo1);
          if (res.lfo2) this.lfoViewModel.updateLfo2(res.lfo2);

          // Sequencer
          if (res.sequencer) {
            this.sequencerViewModel.setBpm(res.sequencer.bpm);
            this.sequencerViewModel.patchState({ steps: res.sequencer.steps, rowCount: res.sequencer.rowCount });
          }
        }),
        map(() => undefined)
      );
  }

  public deletePreset(id: string): Observable<void> {
    return this.http.delete<void>(`/api/patches/${id}`, { headers: this.getAuthHeaders() });
  }

  public updatePreset(id: string, name: string, isPublic: boolean): Observable<SavePresetResult> {
    const synth = this.analogSynthViewModel.getState();
    const effects = this.effectsViewModel.getState();
    const lfo = this.lfoViewModel.getState();
    const seq = this.sequencerViewModel.getState();

    const body = {
      name,
      isPublic,
      oscType: synth.selectedOscType,
      oscillatorCount: synth.oscillatorCount,
      detuneAmount: synth.detuneOscillatorsAmount,
      isPolyphonic: synth.isPolyphonic,
      noiseType: synth.noiseType,
      noiseVolume: synth.noiseVolume,
      masterGain: synth.masterGain,
      filterFrequency: synth.filterFrequency,
      filterResonance: synth.filterResonance,
      filterEnvelopeAmount: synth.filterEnvelopeAmount,
      volAttack: synth.volumeEnvelope.attack,
      volDecay: synth.volumeEnvelope.decay,
      volSustain: synth.volumeEnvelope.sustain,
      volRelease: synth.volumeEnvelope.release,
      filterAttack: synth.filterEnvelope.attack,
      filterDecay: synth.filterEnvelope.decay,
      filterSustain: synth.filterEnvelope.sustain,
      filterRelease: synth.filterEnvelope.release,
      lfo1: { rate: lfo.lfo1.rate, depth: lfo.lfo1.depth, waveform: lfo.lfo1.waveform, destination: lfo.lfo1.destination, keySync: lfo.lfo1.keySync, enabled: lfo.lfo1.enabled },
      lfo2: { rate: lfo.lfo2.rate, depth: lfo.lfo2.depth, waveform: lfo.lfo2.waveform, destination: lfo.lfo2.destination, keySync: lfo.lfo2.keySync, enabled: lfo.lfo2.enabled },
      bpm: seq.bpm,
      rowCount: seq.rowCount,
      steps: seq.steps.map((s) => ({ active: s.active, note: s.note, velocity: s.velocity })),
      distortionAmount: effects.distortion.amount,
      distortionTone: effects.distortion.tone,
      distortionMix: effects.distortion.mix,
      distortionEnabled: effects.distortion.enabled,
      chorusRate: effects.chorus.rate,
      chorusDepth: effects.chorus.depth,
      chorusMix: effects.chorus.mix,
      chorusEnabled: effects.chorus.enabled,
      reverbMix: effects.reverb.mix,
      reverbDecay: effects.reverb.decay,
      reverbEnabled: effects.reverb.enabled,
      delayTime: effects.delay.time,
      delayFeedback: effects.delay.feedback,
      delayMix: effects.delay.mix,
      delayEnabled: effects.delay.enabled,
    };

    return this.http.put<SavePresetResult>(`/api/patches/${id}`, body, { headers: this.getAuthHeaders() });
  }

  public generateAIPatch(description: string, provider: 'openai' | 'anthropic' = 'openai'): Observable<void> {
    return this.synthPatchApiService.generateAIPatch(description, provider).pipe(
      tap((patch) => {
        // Oscillator
        this.analogSynthViewModel.onOscillatorTypeChange(patch.oscillator.type as OscillatorType);
        this.analogSynthViewModel.updateOscillatorCount(patch.oscillator.count);
        this.analogSynthViewModel.updateDetuneOscillatorsAmount(patch.oscillator.detune * 100);
        this.analogSynthViewModel.patchState({ isPolyphonic: patch.oscillator.isPolyphonic });
        this.analogSynthViewModel.updateNoiseType(patch.oscillator.noiseType as 'white' | 'pink' | 'brown');
        this.analogSynthViewModel.updateNoiseVolume(patch.oscillator.noiseVolume);

        // Master
        this.analogSynthViewModel.updateGain(patch.master.gain);

        // Filter: frequency 0-1 → Hz (20-20000); resonance 0-1 → Q (0.1-10)
        this.analogSynthViewModel.updateFilterFrequency(20 + patch.filter.frequency * 19980);
        this.analogSynthViewModel.updateFilterResonance(0.1 + patch.filter.resonance * 9.9);
        this.analogSynthViewModel.updateFilterEnvelopeAmount(patch.filter.envelopeAmount);

        // Envelopes
        this.analogSynthViewModel.updateVolumeEnvelope(patch.volumeEnvelope);
        this.analogSynthViewModel.updateFilterEnvelope(patch.filterEnvelope);

        // Effects — reverb.decay 0-1 → seconds (0.1-10); delay.feedback capped at 0.9
        this.effectsViewModel.patchState({
          distortion: { amount: patch.effects.distortion.amount, tone: patch.effects.distortion.tone, mix: patch.effects.distortion.mix, enabled: patch.effects.distortion.enabled },
          chorus:     { rate: patch.effects.chorus.rate, depth: patch.effects.chorus.depth, mix: patch.effects.chorus.mix, enabled: patch.effects.chorus.enabled },
          reverb:     { mix: patch.effects.reverb.mix, decay: 0.1 + patch.effects.reverb.decay * 9.9, enabled: patch.effects.reverb.enabled },
          delay:      { time: patch.effects.delay.time, feedback: patch.effects.delay.feedback * 0.9, mix: patch.effects.delay.mix, enabled: patch.effects.delay.enabled },
        });

        // LFOs: rate 0-1 → Hz (0-20)
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

        // Sequencer — AI may return 8–64 steps; pad to 64 and derive rowCount
        const aiSteps = patch.sequencer.steps;
        const rowCount = Math.max(1, Math.ceil(aiSteps.length / 8));
        const paddedSteps = [
          ...aiSteps,
          ...Array.from({ length: Math.max(0, 64 - aiSteps.length) }, () => ({ active: false, note: 36, velocity: 100 })),
        ];
        this.sequencerViewModel.setBpm(patch.sequencer.bpm);
        this.sequencerViewModel.patchState({ steps: paddedSteps, rowCount });
      }),
      map(() => undefined),
    );
  }
}
