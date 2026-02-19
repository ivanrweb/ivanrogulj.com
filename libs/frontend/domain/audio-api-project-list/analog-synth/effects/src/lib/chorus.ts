import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

export class ChorusEffect implements AnalogSynthApi.SynthEffect {
  public input: GainNode;
  public output: GainNode;

  private dryGain: GainNode;
  private wetGain: GainNode;
  private delayNode: DelayNode;
  private lfo: OscillatorNode;
  private lfoDepth: GainNode;

  constructor(private context: AudioContext) {
    this.input = context.createGain();
    this.output = context.createGain();

    this.dryGain = context.createGain();
    this.wetGain = context.createGain();

    this.delayNode = context.createDelay();
    this.delayNode.delayTime.value = 0.02;

    this.lfo = context.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 1.5;

    this.lfoDepth = context.createGain();
    this.lfoDepth.gain.value = 0.005;

    this.lfo.connect(this.lfoDepth);
    this.lfoDepth.connect(this.delayNode.delayTime);
    this.lfo.start();

    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);

    this.input.connect(this.delayNode);
    this.delayNode.connect(this.wetGain);
    this.wetGain.connect(this.output);

    this.dryGain.gain.value = 1;
    this.wetGain.gain.value = 0;
  }

  public connect(target: AudioNode): void {
    this.output.connect(target);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public setParam(param: string, value: number): void {
    const now = this.context.currentTime;

    if (param === 'rate') {
      const rate = 0.1 + value * 7.9;
      this.lfo.frequency.setTargetAtTime(rate, now, 0.01);
    }

    if (param === 'depth') {
      const depth = value * 0.015;
      this.lfoDepth.gain.setTargetAtTime(depth, now, 0.01);
    }

    if (param === 'mix') {
      const dryVal = Math.cos(value * 0.5 * Math.PI);
      const wetVal = Math.cos((1.0 - value) * 0.5 * Math.PI);

      this.dryGain.gain.setTargetAtTime(dryVal, now, 0.01);
      this.wetGain.gain.setTargetAtTime(wetVal, now, 0.01);
    }
  }
}
