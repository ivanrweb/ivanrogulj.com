export interface Gain {
  gainValue: number;
  node: GainNode;
}

export interface ADSR {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}
