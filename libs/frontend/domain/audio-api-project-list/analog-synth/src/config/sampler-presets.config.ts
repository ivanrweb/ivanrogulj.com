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

export const SAMPLER_PRESETS: Record<string, SamplerPresetConfig> = {
  piano: {
    label: 'Grand Piano',
    assetPath: 'assets/samples/piano',
    midiRange: [33, 108], // A1–C8
    fileExtension: 'ogg',
    fileNameFn: midiToNoteName, // "C4.ogg", "Cs4.ogg", …
  },
  // Uncomment after placing Rhodes samples in assets/samples/rhodes/
  // rhodes: {
  //   label: 'Fender Rhodes',
  //   assetPath: 'assets/samples/rhodes',
  //   midiRange: [21, 108],
  //   fileExtension: 'ogg',
  //   fileNameFn: (note) => String(note),
  // },
};
