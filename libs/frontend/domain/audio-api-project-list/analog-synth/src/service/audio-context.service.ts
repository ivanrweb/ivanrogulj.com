import { Injectable } from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ADSR } from '@ivanrogulj.com/gain';

@Injectable({ providedIn: 'root' })
export class AudioContextService {
  private _context?: AudioContext;
  private filterNode?: BiquadFilterNode;
  private compressorNode?: DynamicsCompressorNode;
  private masterGain?: GainNode;
  private analyserNode?: AnalyserNode;
  private maxGainForSingleNode = 0.3;

  private FILTER_MIN_FREQ = 20;
  private FILTER_MAX_FREQ = 10000;

  /*
    Initialize AudioContext
   */
  private get context(): AudioContext {
    if (!this._context) {
      this._context = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
      console.log('Started audio context.');
    }
    return this._context!;
  }

  /*
    Method to initialize the audio context and nodes
   */
  public initializeAudioNodes(): void {
    this.filterNode = this.createFilter();
    this.masterGain = this.context.createGain();
    this.analyserNode = this.context.createAnalyser();

    console.log('Audio nodes initialized.');
  }

  /*
    Destroy AudioContext
   */
  public async destroyContext(): Promise<void> {
    await this.context.close();
    console.log('Closed audio context.');
    this._context = undefined;

    // Clear nodes to avoid referencing the old context
    this.filterNode = undefined;
    this.masterGain = undefined;
    this.analyserNode = undefined;
  }

  /*
    1. Oscillator Node
   */

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
    //Slightly detune every new one to make it sound more analog
    return Math.random() * detuneValue - (detuneValue / 2);
  }

  /*
    2. Filter Node
   */

  public createFilter(): BiquadFilterNode {
    const filterNode = this.context.createBiquadFilter();
    filterNode.frequency.value = 5000;
    filterNode.type = 'lowpass';
    return filterNode;
  }

  public updateFilter(frequency: number): void {
    this.filterNode!.frequency.value = frequency;
  }

  /**
    4. Compressor Node
   @param threshold - starts compressing above that value (db), must be a negative number
   @param kneeValue - ease of compression - gradually/abruptly - values below 50 are considered more gradual
   @param ratio - Compression ratio (higher = more aggressive compression). For every 12 dB above the threshold, the output will only increase by only 1 dB
   */
  public createCompressor(threshold: number, kneeValue: number, ratio: number): DynamicsCompressorNode {
    if(threshold >= 0) {
      throw Error();
    }

    this.compressorNode = this.context.createDynamicsCompressor();
    // Set compressor parameters
    this.compressorNode.threshold.setValueAtTime(threshold, this.context.currentTime);
    this.compressorNode.knee.setValueAtTime(kneeValue, this.context.currentTime);
    this.compressorNode.ratio.setValueAtTime(ratio, this.context.currentTime);

    return this.compressorNode;
  }


  /*
    4. Gain Nodes
   */

  public createGain(): GainNode {
    const gainNode = this.context.createGain();

    gainNode.gain.value = this.maxGainForSingleNode;
    return gainNode;
  }

  public setMasterGain(value: number): void {
    this.masterGain!.gain.value = value;
  }

  public updateVolumeEnvelope(gainNode: GainNode, adsr: ADSR): void {
    const now = this.context.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(1, now + adsr.attack);
    gainNode.gain.linearRampToValueAtTime(adsr.sustain, now + adsr.attack + adsr.decay);
  }

  public releaseVolumeEnvelope(gainNode: GainNode, release: number): void {
    const now = this.context.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, now + release);
  }


  /*
    5. Connect and disconnect Nodes
   */
  public getAnalyserNode(): AnalyserNode {
    this.analyserNode!.fftSize = 2048;
    return this.analyserNode!;
  }

  /*
    5. Connect and disconnect Nodes
   */

  public connectNodes(osc: OscillatorNode, gainNode: GainNode): void {
    //TODO: make compressor component and make this parameters changeable on UI from user side
    const compressor = this.createCompressor(-25, 30, 12);

    osc.connect(this.filterNode!);
    this.filterNode!.connect(gainNode);
    gainNode.connect(compressor);
    compressor.connect(this.masterGain!);
    this.masterGain!.connect(this.context.destination);
    //Visual oscilloscope representation of total output
    this.masterGain!.connect(this.analyserNode!);
  }

  public stopAndDisconnectSound(osc: OscillatorNode, gainNode: GainNode): void {
    osc.stop();
    osc.disconnect();
    gainNode.disconnect();
  }

  public normalizedToFrequency(normValue: number): number {
    return this.FILTER_MIN_FREQ + normValue * (this.FILTER_MAX_FREQ - this.FILTER_MIN_FREQ);
  }
}
