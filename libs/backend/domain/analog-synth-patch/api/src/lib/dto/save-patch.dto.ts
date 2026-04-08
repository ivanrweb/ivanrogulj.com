export interface LfoDto {
  rate: number;
  depth: number;
  waveform: string;
  destination: string;
  keySync: boolean;
  enabled: boolean;
}

export interface SequencerStepDto {
  active: boolean;
  note: number;
  velocity: number;
}

export class SavePatchDto {
  public name!: string;
  public isPublic!: boolean;

  // Main patch
  public oscType!: string;
  public oscillatorCount!: number;
  public detuneAmount!: number;
  public isPolyphonic!: boolean;
  public noiseType!: string;
  public noiseVolume!: number;
  public masterGain!: number;
  public filterFrequency!: number;
  public filterResonance!: number;
  public filterEnvelopeAmount!: number;
  public volAttack!: number;
  public volDecay!: number;
  public volSustain!: number;
  public volRelease!: number;
  public filterAttack!: number;
  public filterDecay!: number;
  public filterSustain!: number;
  public filterRelease!: number;

  // LFOs
  public lfo1!: LfoDto;
  public lfo2!: LfoDto;

  // Sequencer
  public bpm!: number;
  public rowCount!: number;
  public steps!: SequencerStepDto[];

  // Effects
  public distortionAmount!: number;
  public distortionTone!: number;
  public distortionMix!: number;
  public distortionEnabled!: boolean;
  public chorusRate!: number;
  public chorusDepth!: number;
  public chorusMix!: number;
  public chorusEnabled!: boolean;
  public reverbMix!: number;
  public reverbDecay!: number;
  public reverbEnabled!: boolean;
  public delayTime!: number;
  public delayFeedback!: number;
  public delayMix!: number;
  public delayEnabled!: boolean;
}
