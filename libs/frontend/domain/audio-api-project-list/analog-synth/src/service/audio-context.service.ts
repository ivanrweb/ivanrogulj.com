import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioContextService {
  private _context?: AudioContext;

  private get context(): AudioContext {
    // Initialize context if not already done
    if (!this._context) {
      this._context = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    }
    return this._context!;
  }

  public async destroyContext(): Promise<void> {
    await this.context.close();
  }

  public createAndStartOsc(): OscillatorNode {
    const osc = this.context.createOscillator();
    this.setOscProperties(osc);
    osc.start();
    return osc;
  }

  //Connects nodes in array order
  public connectArrayOfAudioNodes(nodes: AudioNode[]): void {
    for(let i = 0; i < nodes.length; i++) {
      //connect the last node to destination
      if(i === nodes.length - 1){
        nodes[nodes.length - 1].connect(this.context.destination);
        break;
      }

      nodes[i].connect(nodes[i + 1]);
    }
  }

  public setOscProperties(osc: OscillatorNode): void {
    osc.type = 'sawtooth';
    osc.frequency.value = 440;
  }

  public stopSound(osc: OscillatorNode): void {
    osc.stop();
  }

  public setFilter(filterValue: number): BiquadFilterNode {
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterValue
    return filter;
  }
}
