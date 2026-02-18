import { Injectable } from '@angular/core';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
import {
  DelayEffect,
  DistortionEffect,
  ReverbEffect,
} from '@ivanrogulj.com/effects';

@Injectable({ providedIn: 'root' })
export class AudioContextService {
  private _context?: AudioContext;
  private compressorNode?: DynamicsCompressorNode;
  private masterGain?: GainNode;
  private analyserNode?: AnalyserNode;
  private effectsInputBus?: GainNode;

  //NoiseComponent
  private noiseSource?: AudioBufferSourceNode;
  private noiseGain?: GainNode;
  private currentNoiseType: 'white' | 'pink' | 'brown' = 'brown';

  //Effect references
  private distortionEffect?: DistortionEffect;
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
    this.compressorNode = this.createCompressor(-1, 30, 12);

    // Create Effects Bus
    this.effectsInputBus = this.context.createGain();

    // NoiseComponent setup
    this.noiseGain = this.context.createGain();
    this.noiseGain.gain.value = 0;
    this.noiseGain.connect(this.effectsInputBus);
    this.startNoiseSource();

    // Instantiate effects
    this.distortionEffect = new DistortionEffect(this.context);
    this.reverbEffect = new ReverbEffect(this.context);
    this.delayEffect = new DelayEffect(this.context);

    //CONNECT CHAIN
    //Bus -> Distortion effect
    this.effectsInputBus.connect(this.distortionEffect.input);
    // Bus -> Delay Input
    this.distortionEffect.connect(this.delayEffect.input);
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

  public detuneOscillator(detuneValue: number): number {
    return Math.random() * detuneValue - detuneValue / 2;
  }

  public setNoiseGain(value: number): void {
    if (this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(value, this.currentTime, 0.02);
    }
  }

  public setNoiseType(type: 'white' | 'pink' | 'brown'): void {
    if (this.currentNoiseType === type) return;
    this.currentNoiseType = type;
    this.startNoiseSource();
  }

  public createFilter(): BiquadFilterNode {
    const filterNode = this.context.createBiquadFilter();
    filterNode.type = 'lowpass';
    return filterNode;
  }

  private startNoiseSource(): void {
    if (this.noiseSource) {
      this.noiseSource.stop();
      this.noiseSource.disconnect();
    }

    // Create 2 second buffer and reapeat it
    const bufferSize = 2 * this.context.sampleRate;
    const buffer = this.context.createBuffer(
      1,
      bufferSize,
      this.context.sampleRate
    );
    const data = buffer.getChannelData(0);

    switch (this.currentNoiseType) {
      case 'white':
        this.fillWhiteNoise(data);
        break;
      case 'pink':
        this.fillPinkNoise(data);
        break;
      case 'brown':
        this.fillBrownNoise(data);
        break;
    }

    this.noiseSource = this.context.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;
    this.noiseSource.connect(this.noiseGain!);
    this.noiseSource.start();
  }

  private fillWhiteNoise(data: Float32Array): void {
    // Flat frequency response (0dB/octave).
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  private fillPinkNoise(data: Float32Array): void {
    // Rolls off at -3dB per octave (1/f noise).
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168981;

      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }
  }

  private fillBrownNoise(data: Float32Array): void {
    // Rolls off at -6dB per octave (1/f^2 noise).
    let lastOut = 0.0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;

      // Leaky integrator (equivalent of a low-pass filter)
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
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

    // AdsrEnvelopeComponent always starts from the lowest frequency for classic "sweep" effect.
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
    ratio: number,
    attack = 0.001,
    release = 0.1
  ): DynamicsCompressorNode {
    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(threshold, this.context.currentTime);
    compressor.knee.setValueAtTime(kneeValue, this.context.currentTime);
    compressor.ratio.setValueAtTime(ratio, this.context.currentTime);
    compressor.attack.setValueAtTime(attack, this.context.currentTime);
    compressor.release.setValueAtTime(release, this.context.currentTime);
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
  public setDistortionParams(amount: number): void {
    if (this.distortionEffect) {
      this.distortionEffect.setParam('amount', amount);
    }
  }

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
