// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AnalogSynthApi {
  export interface Voice {
    id: string;
    note: number;
    velocity: number;
    oscNodes: OscillatorNode[];
    filterNode: BiquadFilterNode;
    adsrGainNode: GainNode;
    levelGainNode: GainNode;
  }

  export interface SynthPatch {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  }

  export const KeyboardFrequencies: Record<number, number> = {
    21: 27.5,
    22: 29.1352,
    23: 30.8677,
    24: 32.7032,
    25: 34.6478,
    26: 36.7081,
    27: 38.8909,
    28: 41.2034,
    29: 43.6535,
    30: 46.2493,
    31: 48.9994,
    32: 51.9131,
    33: 55.0,
    34: 58.2705,
    35: 61.7354,
    36: 65.4064,
    37: 69.2957,
    38: 73.4162,
    39: 77.7817,
    40: 82.4069,
    41: 87.3071,
    42: 92.4986,
    43: 97.9989,
    44: 103.826,
    45: 110.0,
    46: 116.541,
    47: 123.471,
    48: 130.813,
    49: 138.591,
    50: 146.832,
    51: 155.563,
    52: 164.814,
    53: 174.614,
    54: 184.997,
    55: 195.998,
    56: 207.652,
    57: 220.0,
    58: 233.082,
    59: 246.942,
    60: 261.626,
    61: 277.183,
    62: 293.665,
    63: 311.127,
    64: 329.628,
    65: 349.228,
    66: 369.994,
    67: 391.995,
    68: 415.305,
    69: 440.0,
    70: 466.164,
    71: 493.883,
    72: 523.251,
    73: 554.365,
    74: 587.33,
    75: 622.254,
    76: 659.255,
    77: 698.456,
    78: 739.989,
    79: 783.991,
    80: 830.609,
    81: 880.0,
    82: 932.328,
    83: 987.767,
    84: 1046.5,
    85: 1108.73,
    86: 1174.66,
    87: 1244.51,
    88: 1318.51,
    89: 1396.91,
    90: 1479.98,
    91: 1567.98,
    92: 1661.22,
    93: 1760.0,
    94: 1864.66,
    95: 1975.53,
    96: 2093.0,
    97: 2217.46,
    98: 2349.32,
    99: 2489.02,
    100: 2637.02,
    101: 2793.83,
    102: 2959.96,
    103: 3135.96,
    104: 3322.44,
    105: 3520.0,
    106: 3729.31,
    107: 3951.07,
    108: 4186.01,
  };

  export interface NoteOn {
    note: number;
    velocity: number;
  }

  export interface ADSR {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  }

  export interface Filter {
    id: string;
    type: BiquadFilterType;
    frequency: number;
    Q?: number;
    node: BiquadFilterNode;
  }

  export interface Gain {
    id: string;
    gainNode: GainNode;
  }

  export interface SynthEffect {
    // Input point where we connect the previous node (GainNode or AudioNode)
    input: AudioNode;
    // Output point which we connect to the next node in the chain
    output: AudioNode;
    // Method to connect to the next element in the chain (e.g. Compressor or next Effect)
    connect(target: AudioNode): void;
    // Method for cleanup (disconnecting nodes)
    disconnect(): void;
    // Generic method for controlling parameters (mix, time, decay...)
    setParam(param: string, value: number): void;
  }

  // UI
  export enum Knob {
    // Volume ADSR
    ATTACK = 'attack',
    DECAY = 'decay',
    SUSTAIN = 'sustain',
    RELEASE = 'release',

    // Filter ADSR
    FILTER_ATTACK = 'filterAttack',
    FILTER_DECAY = 'filterDecay',
    FILTER_SUSTAIN = 'filterSustain',
    FILTER_RELEASE = 'filterRelease',

    // Global
    OSCILLATOR_COUNT = 'oscillatorCount',
    DETUNE_OSCILLATORS_AMOUNT = 'detuneOscillatorsAmount',
    MASTER_GAIN = 'masterGain',
    FILTER_FREQUENCY = 'filterFrequency',
    FILTER_RESONANCE = 'filterResonance',
    FILTER_ENVELOPE_AMOUNT = 'filterEnvelopeAmount',

    // Effects
    DISTORTION_AMOUNT = 'distortionAmount',
    DISTORTION_TONE = 'distortionTone',
    DISTORTION_MIX = 'distortionMix',
    REVERB_MIX = 'reverbMix',
    REVERB_DECAY = 'reverbDecay',
    DELAY_TIME = 'delayTime',
    DELAY_FEEDBACK = 'delayFeedback',
    DELAY_MIX = 'delayMix',
  }
}
