import { Injectable } from '@angular/core';
import { ADSR } from '@ivanrogulj.com/gain';

@Injectable({ providedIn: 'root' })
export class AudioContextService {
  private _context?: AudioContext;
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

  public createAndStartOsc(): OscillatorNode {
    const osc = this.context.createOscillator();
    this.setOscProperties(osc);
    osc.frequency.value = 440;
    osc.start();
    return osc;
  }

  //Connects nodes in array order
  public connectArrayOfAudioNodes(nodes: AudioNode[]): void {
    for(let i = 0; i < nodes.length; i++) {
      //connect the last node to destination
      if(i === nodes.length - 1){
        nodes[nodes.length - 1].connect(this.gainNode);
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
    return filterNode;
  }

  public createGain(): GainNode {
    const gainNode= this.context.createGain();
    gainNode.gain.value = 0.5;
    return gainNode;
  }

  public updateGain(gainValue?: number, adsrEnvelope?: ADSR): GainNode {
    this.gainNode.gain.value = gainValue ?? 0.5;
    return this.gainNode;
  }
}
