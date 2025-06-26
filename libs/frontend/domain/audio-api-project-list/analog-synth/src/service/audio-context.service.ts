import { Injectable } from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ADSR } from '@ivanrogulj.com/gain';

@Injectable({ providedIn: 'root' })
export class AudioContextService {
  private _context?: AudioContext;
  private compressorNode?: DynamicsCompressorNode;
  private masterGain?: GainNode;
  private analyserNode?: AnalyserNode;

  private FILTER_MIN_FREQ = 20;
  private FILTER_MAX_FREQ = 10000;

  private get context(): AudioContext {
    if (!this._context) {
      this._context = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
      console.log('Started audio context.');
    }
    return this._context!;
  }

  public initializeAudioNodes(): void {
    this.masterGain = this.context.createGain();
    this.analyserNode = this.context.createAnalyser();
    this.compressorNode = this.createCompressor(-25, 30, 12);

    this.compressorNode.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);
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
    return Math.random() * detuneValue - (detuneValue / 2);
  }

  public createFilter(): BiquadFilterNode {
    const filterNode = this.context.createBiquadFilter();
    filterNode.type = 'lowpass';
    return filterNode;
  }

  public applyFilterEnvelope(filterNode: BiquadFilterNode, adsr: ADSR, baseFrequency: number, amount: number): void {
    const now = this.context.currentTime;
    const filterFreq = filterNode.frequency;
    filterFreq.cancelScheduledValues(now);
    filterFreq.setValueAtTime(baseFrequency, now);
    const peakFrequency = baseFrequency + amount * (this.FILTER_MAX_FREQ - baseFrequency);
    const clampedPeak = Math.min(peakFrequency, this.FILTER_MAX_FREQ);
    const sustainFrequency = baseFrequency + (adsr.sustain * (clampedPeak - baseFrequency));
    const clampedSustain = Math.min(sustainFrequency, this.FILTER_MAX_FREQ);
    filterFreq.linearRampToValueAtTime(clampedPeak, now + adsr.attack);
    filterFreq.linearRampToValueAtTime(clampedSustain, now + adsr.attack + adsr.decay);
  }

  public releaseFilterEnvelope(filterNode: BiquadFilterNode, releaseTime: number): void {
    const now = this.context.currentTime;
    const filterFreq = filterNode.frequency;
    filterFreq.cancelScheduledValues(now);
    filterFreq.setValueAtTime(filterFreq.value, now);
    filterFreq.linearRampToValueAtTime(this.FILTER_MIN_FREQ, now + releaseTime);
  }

  public createCompressor(threshold: number, kneeValue: number, ratio: number): DynamicsCompressorNode {
    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(threshold, this.context.currentTime);
    compressor.knee.setValueAtTime(kneeValue, this.context.currentTime);
    compressor.ratio.setValueAtTime(ratio, this.context.currentTime);
    return compressor;
  }

  public createGain(): GainNode {
    const gainNode = this.context.createGain();
    gainNode.gain.value = 0; // ADSR gain starts at 0
    return gainNode;
  }

  public setMasterGain(value: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(value, this.context.currentTime, 0.01);
    }
  }

  public applyVolumeEnvelope(gainNode: GainNode, adsr: ADSR): void {
    const now = this.context.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + adsr.attack);
    gainNode.gain.linearRampToValueAtTime(adsr.sustain, now + adsr.attack + adsr.decay);
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

  public connectVoiceNodes(osc: OscillatorNode, filterNode: BiquadFilterNode, adsrGainNode: GainNode, levelGainNode: GainNode): void {
    osc.connect(filterNode);
    filterNode.connect(adsrGainNode);
    adsrGainNode.connect(levelGainNode);
    levelGainNode.connect(this.compressorNode!);
  }

  public stopAndDisconnectVoice(osc: OscillatorNode, filterNode: BiquadFilterNode, adsrGainNode: GainNode, levelGainNode: GainNode): void {
    osc.stop();
    osc.disconnect();
    filterNode.disconnect();
    adsrGainNode.disconnect();
    levelGainNode.disconnect();
  }

  public normalizedToFrequency(normValue: number): number {
    if (typeof normValue !== 'number' || !isFinite(normValue)) {
      console.error('normalizedToFrequency received a non-finite value:', normValue);
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
}
