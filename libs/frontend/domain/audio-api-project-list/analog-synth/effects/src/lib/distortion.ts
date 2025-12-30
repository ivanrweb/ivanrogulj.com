import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

/**
 * Implements a non-linear distortion effect using a WaveShaperNode.
 * * Signal Path:
 * Input -> Drive Gain -> WaveShaper (Sigmoid Curve) -> Output Gain -> Output
 */
export class DistortionEffect implements AnalogSynthApi.SynthEffect {
  public input: GainNode;
  public output: GainNode;

  private waveShaper: WaveShaperNode;

  /** Controls the input amplitude entering the WaveShaper. Higher values result in more saturation. */
  private driveGain: GainNode;

  /** Compensates for the volume increase caused by the WaveShaper saturation. */
  private outputGain: GainNode;

  constructor(private context: AudioContext) {
    this.input = context.createGain();
    this.output = context.createGain();
    this.waveShaper = context.createWaveShaper();
    this.driveGain = context.createGain();
    this.outputGain = context.createGain();

    // Signal Routing
    this.input.connect(this.driveGain);
    this.driveGain.connect(this.waveShaper);
    this.waveShaper.connect(this.outputGain);
    this.outputGain.connect(this.output);

    // Initialization
    this.waveShaper.curve = this.makeDistortionCurve(0);
    this.waveShaper.oversample = '4x'; // Reduces aliasing artifacts
    this.driveGain.gain.value = 1;
    this.outputGain.gain.value = 1;
  }

  public connect(target: AudioNode): void {
    this.output.connect(target);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  /**
   * Updates the effect parameters.
   * @param param - 'amount' (0.0 to 1.0)
   * @param value - The value to set.
   */
  public setParam(param: string, value: number): void {
    if (param === 'amount') {
      // Normalize input (0-1) to a drive scale (0-1000) for the algorithm
      const distortionAmount = value * 1000;

      this.waveShaper.curve = this.makeDistortionCurve(distortionAmount);

      // Auto-makeup gain: reduce output volume as distortion increases to maintain perceived loudness
      // value 0 -> gain 1.0; value 1 -> gain 0.1
      const makeupGain = 1 - value * 0.9;
      this.outputGain.gain.setTargetAtTime(
        makeupGain,
        this.context.currentTime,
        0.02
      );
    }
  }

  /**
   * Generates a sigmoid distortion curve for the WaveShaperNode.
   * Algorithm based on standard WS curve implementations.
   * * @param amount - The intensity of the distortion (k).
   */
  private makeDistortionCurve(amount: number): Float32Array {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
}
