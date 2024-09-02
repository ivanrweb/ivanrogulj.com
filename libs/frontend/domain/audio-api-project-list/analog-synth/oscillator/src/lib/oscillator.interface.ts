export interface Oscillator {
  id: string;
  type: OscillatorType;
  frequency: number;
  detune: number;
  isPlaying: boolean;
  node: OscillatorNode;
}
