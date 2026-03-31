export class LfoEngine {
  private oscillator: OscillatorNode;
  private readonly depthGain: GainNode;

  constructor(private readonly context: AudioContext) {
    this.oscillator = context.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = 1;
    this.depthGain = context.createGain();
    this.depthGain.gain.value = 0;
    this.oscillator.connect(this.depthGain);
    this.oscillator.start();
  }

  public setRate(hz: number): void {
    this.oscillator.frequency.setTargetAtTime(
      hz,
      this.context.currentTime,
      0.01
    );
  }

  public setDepth(amount: number, scale: number): void {
    this.depthGain.gain.setTargetAtTime(
      amount * scale,
      this.context.currentTime,
      0.01
    );
  }

  public setWaveform(type: OscillatorType): void {
    this.oscillator.type = type;
  }

  public connectParam(param: AudioParam): void {
    this.depthGain.connect(param);
  }

  public disconnectAll(): void {
    this.depthGain.disconnect();
  }

  public disable(): void {
    this.depthGain.gain.setTargetAtTime(0, this.context.currentTime, 0.01);
  }

  // Recreate the oscillator to reset phase to 0 (key sync)
  public keySync(): void {
    const currentType = this.oscillator.type;
    const currentRate = this.oscillator.frequency.value;
    this.oscillator.stop();
    this.oscillator.disconnect();
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = currentType;
    this.oscillator.frequency.value = currentRate;
    this.oscillator.connect(this.depthGain);
    this.oscillator.start();
  }
}
