export interface Oscillator {
  id: string;
  type: OscillatorType;
  frequency: number;
  detune: number;
  node: OscillatorNode;
}
