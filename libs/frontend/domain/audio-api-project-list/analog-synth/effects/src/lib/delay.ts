import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

export class DelayEffect implements AnalogSynthApi.SynthEffect {
  public input: GainNode;
  public output: GainNode;
  private delayNode: DelayNode;
  private feedbackGain: GainNode;
  private wetGain: GainNode;

  constructor(private context: AudioContext) {
    this.input = context.createGain();
    this.output = context.createGain();
    this.delayNode = context.createDelay(5.0); // Max 5 sec
    this.feedbackGain = context.createGain();
    this.wetGain = context.createGain();

    // Routing
    // Input -> Output (Dry signal, always passed through for now)
    this.input.connect(this.output);

    // Input -> Delay -> WetGain -> Output
    this.input.connect(this.delayNode);
    this.delayNode.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delayNode); // Feedback loop
    this.delayNode.connect(this.wetGain);
    this.wetGain.connect(this.output);

    // Defaults
    this.delayNode.delayTime.value = 0.5;
    this.feedbackGain.gain.value = 0.3;
    this.wetGain.gain.value = 0; // Mix initially turned off
  }

  public connect(target: AudioNode): void {
    this.output.connect(target);
  }
  public disconnect(): void {
    this.output.disconnect();
  }

  public setParam(param: string, value: number): void {
    const now = this.context.currentTime;
    if (param === 'time')
      this.delayNode.delayTime.setTargetAtTime(value, now, 0.01);
    if (param === 'feedback')
      this.feedbackGain.gain.setTargetAtTime(value, now, 0.01);
    if (param === 'mix') this.wetGain.gain.setTargetAtTime(value, now, 0.01);
  }
}
