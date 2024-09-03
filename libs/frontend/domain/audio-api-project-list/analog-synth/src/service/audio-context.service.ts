import { Injectable } from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ADSR } from '@ivanrogulj.com/gain';

@Injectable({ providedIn: 'root' })
export class AudioContextService {
  private _context?: AudioContext;
  private filterNode: BiquadFilterNode = this.createFilter();
  private gainNode: GainNode = this.createGain();

  private get context(): AudioContext {
    // Initialize context if not already done
    if (!this._context) {
      this._context = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    }
    return this._context!;
  }

  public async destroyContext(): Promise<void> {
    await this.context.close();
    this._context = undefined;
  }

  public createAndStartOsc(frequency?: number): OscillatorNode {
    const osc = this.context.createOscillator();
    this.setOscProperties(osc);
    osc.frequency.value = frequency ?? 440;
    osc.start();
    return osc;
  }

  //Connects nodes in array order
  public connectArrayOfAudioNodes(nodes: AudioNode[]): void {
    for(let i = 0; i < nodes.length; i++) {
      //connect the last node to destination
      if(i === nodes.length - 1){
        //create connections for single nodes common for all oscillators
        nodes[nodes.length - 1].connect(this.filterNode);
        this.filterNode.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);
        break;
      }

      nodes[i].connect(nodes[i + 1]);
    }
  }

  public setOscProperties(osc: OscillatorNode): void {
    osc.type = 'sawtooth';
    osc.frequency.value = 440;
  }

  public stopAndDisconnect(osc: OscillatorNode): void {
    osc.stop();
    osc.disconnect();
  }

  public createFilter(): BiquadFilterNode {
    const filterNode = this.context.createBiquadFilter();
    filterNode.frequency.value = 5000;
    filterNode.type = 'lowpass';
    return filterNode;
  }

  public updateFilter(frequency: number): void {
    this.filterNode.frequency.value = frequency;
  }

  public createGain(): GainNode {
    const gainNode= this.context.createGain();
    gainNode.gain.value = 0.5;
    return gainNode;
  }

  public updateGain(gainValue: number): GainNode {
    this.gainNode.gain.value = gainValue;
    return this.gainNode;
  }

  public updateVolumeEnvelope(adsr: ADSR): void {
    const now = this.context.currentTime;
    // Cancel any existing scheduled values
    this.gainNode.gain.cancelScheduledValues(now);
    // Set the initial value
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    // Apply Attack
    this.gainNode.gain.linearRampToValueAtTime(1, now + adsr.attack);
    // Apply Decay and Sustain
    this.gainNode.gain.linearRampToValueAtTime(adsr.sustain, now + adsr.attack + adsr.decay);
    // Apply Release
    //this.gainNode.gain.linearRampToValueAtTime(0, now + adsr.attack + adsr.decay + adsr.release);
  }

  // Apply release phase to the gain node
  public releaseVolumeEnvelope(release: number): void {
    const now = this.context.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + release);
  }
}
