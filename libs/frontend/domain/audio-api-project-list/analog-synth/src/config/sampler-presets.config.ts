const NOTE_NAMES = [
  'C',
  'Cs',
  'D',
  'Ds',
  'E',
  'F',
  'Fs',
  'G',
  'Gs',
  'A',
  'As',
  'B',
];

export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return NOTE_NAMES[midi % 12] + octave;
}

export interface SamplerPresetConfig {
  label: string;
  /** Base URL or asset path (without trailing slash) */
  assetPath: string;
  /** OGG files from assetPath — midiRange[0..1] inclusive */
  midiRange: [number, number];
  /** File extension, default 'ogg' */
  fileExtension?: string;
  /**
   * Filename (without extension) for a given MIDI note.
   * Default: (note) => String(note)  →  "60.ogg"
   * tonejs-style: midiToNoteName     →  "C4.ogg"
   */
  fileNameFn?: (note: number) => string;
}

// Flat-notation names used by gleitz/midi-js-soundfonts (FluidR3_GM)
// e.g. MIDI 61 → "Db4.mp3"  (vs tonejs sharps: "Cs4.ogg")
const NOTE_NAMES_FLAT = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
];
export function midiToNoteNameFlat(midi: number): string {
  return NOTE_NAMES_FLAT[midi % 12] + (Math.floor(midi / 12) - 1);
}

export const SAMPLER_PRESETS: Record<string, SamplerPresetConfig> = {
  piano: {
    label: 'Grand Piano',
    assetPath: 'assets/samples/piano',
    midiRange: [33, 108],
    fileExtension: 'ogg',
    fileNameFn: midiToNoteName,
  },
  rhodes: {
    label: 'Fender Rhodes',
    assetPath: 'assets/samples/rhodes',
    midiRange: [21, 108],
    fileExtension: 'mp3',
    fileNameFn: midiToNoteNameFlat,
  },
  wurlitzer: {
    label: 'Wurlitzer',
    assetPath: 'assets/samples/wurlitzer',
    midiRange: [21, 108],
    fileExtension: 'mp3',
    fileNameFn: midiToNoteNameFlat,
  },
  hammond: {
    label: 'Hammond Organ',
    assetPath: 'assets/samples/hammond',
    midiRange: [21, 108],
    fileExtension: 'mp3',
    fileNameFn: midiToNoteNameFlat,
  },
  'synth-lead': {
    label: 'Synth Lead (Saw)',
    assetPath: 'assets/samples/synth-lead',
    midiRange: [21, 108],
    fileExtension: 'mp3',
    fileNameFn: midiToNoteNameFlat,
  },
  polysynth: {
    label: 'PolySynth',
    assetPath: 'assets/samples/polysynth',
    midiRange: [21, 108],
    fileExtension: 'mp3',
    fileNameFn: midiToNoteNameFlat,
  },
  churchOrgan: {
    label: 'ChurchOrgan',
    assetPath: 'assets/samples/church_organ',
    midiRange: [21, 108],
    fileExtension: 'mp3',
    fileNameFn: midiToNoteNameFlat,
  },
  synthBrass: {
    label: 'SynthBrass',
    assetPath: 'assets/samples/synth_brass',
    midiRange: [21, 108],
    fileExtension: 'mp3',
    fileNameFn: midiToNoteNameFlat,
  },
  slapBass: {
    label: 'SlapBass',
    assetPath: 'assets/samples/slap_bass',
    midiRange: [21, 108],
    fileExtension: 'mp3',
    fileNameFn: midiToNoteNameFlat,
  },
};
