import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

export class ReverbEffect implements AnalogSynthApi.SynthEffect {
  public input: GainNode;
  public output: GainNode;
  private convolver: ConvolverNode;
  private wetGain: GainNode;

  constructor(private context: AudioContext) {
    this.input = context.createGain();
    this.output = context.createGain();
    this.convolver = context.createConvolver();
    this.wetGain = context.createGain();

    // Routing
    // Input -> Output (Dry signal, always passed through)
    this.input.connect(this.output);

    // Input -> Convolver -> WetGain -> Output
    this.input.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.wetGain.connect(this.output);

    // Defaults
    this.generateImpulseResponse(2.0); // Default 2 seconds decay
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

    if (param === 'mix') {
      this.wetGain.gain.setTargetAtTime(value, now, 0.01);
    }

    if (param === 'decay') {
      // Re-generate the room impulse response when decay changes
      // Value here represents seconds (e.g., 0.1s to 5s)
      this.generateImpulseResponse(value);
    }
  }

  // Generates synthetic "room" noise
  private generateImpulseResponse(duration: number): void {
    // Safety check to prevent creating 0-length buffers
    const safeDuration = Math.max(0.1, duration);
    const rate = this.context.sampleRate;
    const length = rate * safeDuration;

    const impulse = this.context.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      // Linear fade out (simpler than exponential for performance)
      // Exponential: Math.pow(1 - i / length, decay)
      const n = i / length;
      const factor = Math.pow(1 - n, 2);

      // White noise * decay envelope
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }

    this.convolver.buffer = impulse;
  }
}
