import { Injectable } from '@angular/core';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
import { DelayEffect, ReverbEffect } from '@ivanrogulj.com/effects';

@Injectable({ providedIn: 'root' })
export class AudioContextService {
  private _context?: AudioContext;
  private compressorNode?: DynamicsCompressorNode;
  private masterGain?: GainNode;
  private analyserNode?: AnalyserNode;
  private effectsInputBus?: GainNode;

  //Effect references
  private reverbEffect?: ReverbEffect;
  private delayEffect?: DelayEffect;

  private FILTER_MIN_FREQ = 20;
  private FILTER_MAX_FREQ = 10000;

  private get context(): AudioContext {
    if (!this._context) {
      this._context = new ((window as any).AudioContext ||
        (window as any).webkitAudioContext)();
      console.log('Started audio context.');
    }
    return this._context!;
  }

  public initializeAudioNodes(): void {
    this.masterGain = this.context.createGain();
    this.analyserNode = this.context.createAnalyser();
    this.compressorNode = this.createCompressor(-25, 30, 12);

    // Create Effects Bus
    this.effectsInputBus = this.context.createGain();

    // Instantiate effects
    this.reverbEffect = new ReverbEffect(this.context);
    this.delayEffect = new DelayEffect(this.context);

    //CONNECT CHAIN
    // Bus -> Delay Input
    this.effectsInputBus.connect(this.delayEffect.input);
    // Delay Output -> Reverb Input
    this.delayEffect.connect(this.reverbEffect.input);
    // Reverb Output -> Compressor
    this.reverbEffect.connect(this.compressorNode);
    // Compressor -> Master Gain
    this.compressorNode.connect(this.masterGain);
    // Master Gain -> Destination
    this.masterGain.connect(this.context.destination);
    // Master also goes to analyser
    this.masterGain.connect(this.analyserNode);

    console.log('Global audio nodes initialized.');
  }

  public async destroyContext(): Promise<void> {
    await this.context.close();
    console.log('Closed audio context.');
    this._context = undefined;
    this.masterGain = undefined;
    this.analyserNode = undefined;
    this.compressorNode = undefined;
  }

  public createOsc(oscType: OscillatorType, frequency: number): OscillatorNode {
    const osc = this.context.createOscillator();
    osc.type = oscType;
    osc.frequency.value = frequency;
    osc.detune.value = this.detuneOscillator(5);
    return osc;
  }

  public startOsc(oscNode: OscillatorNode): void {
    oscNode.start();
  }

  public detuneOscillator(detuneValue: number): number {
    return Math.random() * detuneValue - detuneValue / 2;
  }

  public createFilter(): BiquadFilterNode {
    const filterNode = this.context.createBiquadFilter();
    filterNode.type = 'lowpass';
    return filterNode;
  }

  // Directly set filter frequency, bypassing filter envelope
  // Use it for changes in real-time while notes are already playing
  public setFilterFrequency(
    filterNode: BiquadFilterNode,
    frequency: number
  ): void {
    const now = this.context.currentTime;
    // Destroy all past envelope changes
    filterNode.frequency.cancelScheduledValues(now);
    // Smoothly set new frequency
    filterNode.frequency.setTargetAtTime(frequency, now, 0.01);
  }

  public applyFilterEnvelope(
    filterNode: BiquadFilterNode,
    adsr: AnalogSynthApi.ADSR,
    baseFrequency: number,
    amount: number
  ): void {
    const now = this.context.currentTime;
    const filterFreq = filterNode.frequency;

    // Cutoff knob now controls frequency on which the sound is stabilized (sustain).
    const sustainFrequency = baseFrequency;

    // 'amount' controls how high envelope "jumps" over sustain frequency.
    // here we define the max range of that jump - for example, 5000 Hz.
    const modulationDepth = 5000;
    const peakFrequency = sustainFrequency + amount * modulationDepth;

    // Ensure that values don't go over the threshold.
    const clampedPeak = Math.min(peakFrequency, this.FILTER_MAX_FREQ);
    const clampedSustain = Math.max(this.FILTER_MIN_FREQ, sustainFrequency);

    // Envelope always starts from the lowest frequency for classic "sweep" effect.
    const startFrequency = this.FILTER_MIN_FREQ;

    filterFreq.cancelScheduledValues(now);
    filterFreq.setValueAtTime(startFrequency, now);
    filterFreq.linearRampToValueAtTime(clampedPeak, now + adsr.attack);
    // After "jump", frequency drops to value set by knob.
    filterFreq.linearRampToValueAtTime(
      clampedSustain,
      now + adsr.attack + adsr.decay
    );
  }

  public releaseFilterEnvelope(
    filterNode: BiquadFilterNode,
    releaseTime: number
  ): void {
    const now = this.context.currentTime;
    const filterFreq = filterNode.frequency;
    filterFreq.cancelScheduledValues(now);
    filterFreq.setValueAtTime(filterFreq.value, now);
    filterFreq.linearRampToValueAtTime(this.FILTER_MIN_FREQ, now + releaseTime);
  }

  public createCompressor(
    threshold: number,
    kneeValue: number,
    ratio: number
  ): DynamicsCompressorNode {
    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(threshold, this.context.currentTime);
    compressor.knee.setValueAtTime(kneeValue, this.context.currentTime);
    compressor.ratio.setValueAtTime(ratio, this.context.currentTime);
    return compressor;
  }

  public createGain(): GainNode {
    const gainNode = this.context.createGain();
    gainNode.gain.value = 0;
    return gainNode;
  }

  public setMasterGain(value: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        value,
        this.context.currentTime,
        0.01
      );
    }
  }

  public applyVolumeEnvelope(
    gainNode: GainNode,
    adsr: AnalogSynthApi.ADSR
  ): void {
    const now = this.context.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + adsr.attack);
    gainNode.gain.linearRampToValueAtTime(
      adsr.sustain,
      now + adsr.attack + adsr.decay
    );
  }

  public releaseVolumeEnvelope(gainNode: GainNode, release: number): void {
    const now = this.context.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, now + release);
  }

  public getAnalyserNode(): AnalyserNode {
    this.analyserNode!.fftSize = 2048;
    return this.analyserNode!;
  }

  public connectVoiceNodes(
    filterNode: BiquadFilterNode,
    adsrGainNode: GainNode,
    levelGainNode: GainNode
  ): void {
    filterNode.connect(adsrGainNode);
    adsrGainNode.connect(levelGainNode);

    if (this.effectsInputBus) {
      levelGainNode.connect(this.effectsInputBus);
    } else {
      levelGainNode.connect(this.compressorNode!);
    }
  }

  public stopAndDisconnectVoice(
    oscs: OscillatorNode | OscillatorNode[],
    filterNode: BiquadFilterNode,
    adsrGainNode: GainNode,
    levelGainNode: GainNode
  ): void {
    const oscArray = Array.isArray(oscs) ? oscs : [oscs];

    oscArray.forEach((osc) => {
      osc.stop();
      osc.disconnect();
    });

    filterNode.disconnect();
    adsrGainNode.disconnect();
    levelGainNode.disconnect();
  }

  public normalizedToFrequency(normValue: number): number {
    if (typeof normValue !== 'number' || !isFinite(normValue)) {
      return this.FILTER_MIN_FREQ;
    }
    const minLog = Math.log(this.FILTER_MIN_FREQ);
    const maxLog = Math.log(this.FILTER_MAX_FREQ);
    const clampedNormValue = Math.max(0, Math.min(1, normValue));
    const logFreq = minLog + clampedNormValue * (maxLog - minLog);
    return Math.exp(logFreq);
  }

  public get currentTime(): number {
    return this.context.currentTime;
  }

  //EFFECTS

  public setReverbParams(mix: number, decay: number): void {
    if (this.reverbEffect) {
      this.reverbEffect.setParam('mix', mix);
      this.reverbEffect.setParam('decay', decay);
    }
  }

  public setDelayParams(time: number, feedback: number, mix: number): void {
    if (this.delayEffect) {
      this.delayEffect.setParam('time', time);
      this.delayEffect.setParam('feedback', feedback);
      this.delayEffect.setParam('mix', mix);
    }
  }
}
