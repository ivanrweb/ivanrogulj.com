import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

/**
 * Implements a non-linear distortion effect using a WaveShaperNode.
 * * Signal Path:
 * Input -> Drive Gain -> WaveShaper (Sigmoid Curve) -> Output Gain -> Output
 */
export class DistortionEffect implements AnalogSynthApi.SynthEffect {
  public input: GainNode;
  public output: GainNode;

  public waveShaper: WaveShaperNode;

  /** Controls the input amplitude entering the WaveShaper. Higher values result in more saturation. */
  public driveGain: GainNode;

  /** Compensates for the volume increase caused by the WaveShaper saturation. */
  public outputGain: GainNode;

  public toneFilter: BiquadFilterNode;
  public dryGain: GainNode;
  public wetGain: GainNode;

  constructor(private context: AudioContext) {
    this.input = context.createGain();
    this.output = context.createGain();
    this.waveShaper = context.createWaveShaper();
    this.driveGain = context.createGain();
    this.outputGain = context.createGain();
    this.toneFilter = context.createBiquadFilter();
    this.dryGain = context.createGain();
    this.wetGain = context.createGain();

    this.toneFilter.type = 'lowpass';

    // Signal Routing
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);

    this.input.connect(this.driveGain);
    this.driveGain.connect(this.waveShaper);
    this.waveShaper.connect(this.toneFilter);
    this.toneFilter.connect(this.outputGain);
    this.outputGain.connect(this.wetGain);
    this.wetGain.connect(this.output);

    // Initialization
    this.waveShaper.curve = this.makeDistortionCurve(0);
    this.waveShaper.oversample = '4x';
    this.driveGain.gain.value = 1;
    this.outputGain.gain.value = 1;

    this.toneFilter.frequency.value = 20000;
    this.dryGain.gain.value = 0;
    this.wetGain.gain.value = 1;
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
    const now = this.context.currentTime;

    if (param === 'amount') {
      // Normalize input (0-1) to a drive scale (0-1000) for the algorithm
      const distortionAmount = value * 1000;

      this.waveShaper.curve = this.makeDistortionCurve(distortionAmount);

      // Auto-makeup gain: reduce output volume as distortion increases to maintain perceived loudness
      // value 0 -> gain 1.0; value 1 -> gain 0.1
      const makeupGain = 1 - value * 0.9;
      this.outputGain.gain.setTargetAtTime(makeupGain, now, 0.02);
    }

    if (param === 'tone') {
      const minFreq = 500;
      const maxFreq = 20000;
      const freq = minFreq * Math.pow(maxFreq / minFreq, value);
      this.toneFilter.frequency.setTargetAtTime(freq, now, 0.02);
    }

    if (param === 'mix') {
      const dryVal = Math.cos(value * 0.5 * Math.PI);
      const wetVal = Math.cos((1.0 - value) * 0.5 * Math.PI);

      this.dryGain.gain.setTargetAtTime(dryVal, now, 0.02);
      this.wetGain.gain.setTargetAtTime(wetVal, now, 0.02);
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
