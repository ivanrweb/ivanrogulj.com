export interface Gain {
  id: string;
  gainNode: GainNode;
}

export interface ADSR {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}
