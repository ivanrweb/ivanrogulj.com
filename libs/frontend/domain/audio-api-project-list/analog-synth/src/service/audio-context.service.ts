import { Injectable } from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ADSR } from '@ivanrogulj.com/gain';

@Injectable({ providedIn: 'root' })
export class AudioContextService {
  private _context?: AudioContext;
  private filterNode: BiquadFilterNode = this.createFilter();
  private masterGainNode: GainNode = this.createMasterGain();

  //Visual nodes
  private analyserNode = this.context.createAnalyser();

  /*
    Initialize AudioContext
   */
  private get context(): AudioContext {
    if (!this._context) {
      this._context = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
      console.log('started audio context...');
    }
    return this._context!;
  }

  /*
    Destroy AudioContext
   */
  public async destroyContext(): Promise<void> {
    await this.context.close();
    this._context = undefined;
  }

  /*
    1. Oscillator Node
   */

  public createOsc(oscType: OscillatorType, frequency: number): OscillatorNode {
    const osc = this.context.createOscillator();
    osc.type = oscType;
    osc.frequency.value = frequency;
    osc.detune.value = Math.random() * 5 - 2.5;  //Slightly detune every new one to make it sound more analog

    return osc;
  }

  public startOsc(oscNode: OscillatorNode): void {
    oscNode.start();
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
    this.filterNode.frequency.value = frequency;
  }

  /*
    3. Gain Nodes
   */

  public createGain(): GainNode {
    const gainNode = this.context.createGain();
    gainNode.gain.value = 0.33;
    return gainNode;
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
    4. Master Gain Node
   */

  public createMasterGain(): GainNode {
    const gainNode = this.context.createGain();
    gainNode.gain.value = 0.1;
    gainNode.connect(this.context.destination);
    return gainNode;
  }

  /*
    5. Connect and disconnect Nodes
   */
  public getAnalyserNode(): AnalyserNode {
    this.analyserNode.fftSize = 2048;
    return this.analyserNode;
  }

  /*
    5. Connect and disconnect Nodes
   */

  public connectNodes(osc: OscillatorNode, gainNode: GainNode): void {
    osc.connect(this.filterNode);
    this.filterNode.connect(gainNode);
    gainNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.context.destination);

    //Visual oscilloscope representation of total output
    this.masterGainNode.connect(this.analyserNode);
  }

  public stopAndDisconnectSound(osc: OscillatorNode, gainNode: GainNode): void {
    osc.stop();
    osc.disconnect();
    gainNode.disconnect();
  }
}
