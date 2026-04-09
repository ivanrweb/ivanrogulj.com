import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

// Short 8-step example (1 row) — keeps the prompt compact
const EXAMPLE_PATCH: AnalogSynthApi.FullSynthPatchJson = {
  oscillator: {
    type: 'sawtooth',
    count: 2,
    detune: 0.3,
    isPolyphonic: false,
    noiseType: 'white',
    noiseVolume: 0.0,
  },
  filter: {
    frequency: 0.35,
    resonance: 0.4,
    envelopeAmount: 0.6,
  },
  volumeEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.15 },
  filterEnvelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.1 },
  lfo1: {
    rate: 0.15,
    depth: 0.1,
    waveform: 'sine',
    destination: 'filterCutoff',
    keySync: true,
    enabled: true,
  },
  lfo2: {
    rate: 0.05,
    depth: 0.0,
    waveform: 'sine',
    destination: 'none',
    keySync: false,
    enabled: false,
  },
  effects: {
    distortion: { amount: 0.3, tone: 0.6, mix: 0.4, enabled: true },
    chorus: { rate: 0.2, depth: 0.15, mix: 0.1, enabled: false },
    reverb: { mix: 0.15, decay: 0.3, enabled: true },
    delay: { time: 0.5, feedback: 0.2, mix: 0.1, enabled: false },
  },
  master: { gain: 0.85 },
  sequencer: {
    bpm: 120,
    rowCount: 1,
    // 8 steps: C2 groove in C minor
    steps: [
      { active: true, note: 36, velocity: 110 },
      { active: false, note: 36, velocity: 100 },
      { active: true, note: 36, velocity: 90 },
      { active: true, note: 31, velocity: 100 },
      { active: false, note: 31, velocity: 100 },
      { active: true, note: 34, velocity: 105 },
      { active: true, note: 31, velocity: 90 },
      { active: true, note: 29, velocity: 100 },
    ],
  },
};

export const GENERATE_PATCH_PROMPT = `You are an analog synthesizer patch designer.
Return ONLY valid JSON — no markdown, no explanations, no comments.

The JSON must follow this exact structure (all numeric values are normalized 0.0–1.0 unless noted):

{
  "oscillator": {
    "type": "sine" | "square" | "sawtooth" | "triangle",
    "count": 1–4 (integer),
    "detune": 0.0–1.0,
    "isPolyphonic": true | false,
    "noiseType": "white" | "pink" | "brown",
    "noiseVolume": 0.0–1.0
  },
  "filter": {
    "frequency": 0.0–1.0,
    "resonance": 0.0–1.0,
    "envelopeAmount": 0.0–1.0
  },
  "volumeEnvelope": { "attack": 0.0–1.0, "decay": 0.0–1.0, "sustain": 0.0–1.0, "release": 0.0–1.0 },
  "filterEnvelope": { "attack": 0.0–1.0, "decay": 0.0–1.0, "sustain": 0.0–1.0, "release": 0.0–1.0 },
  "lfo1": {
    "rate": 0.0–1.0, "depth": 0.0–1.0,
    "waveform": "sine" | "square" | "sawtooth" | "triangle",
    "destination": "none" | "filterCutoff" | "pitch" | "volume" | "delayTime",
    "keySync": true | false, "enabled": true | false
  },
  "lfo2": { (same structure as lfo1) },
  "effects": {
    "distortion": { "amount": 0.0–1.0, "tone": 0.0–1.0, "mix": 0.0–1.0, "enabled": true | false },
    "chorus":     { "rate": 0.0–1.0,   "depth": 0.0–1.0, "mix": 0.0–1.0, "enabled": true | false },
    "reverb":     { "mix": 0.0–1.0,    "decay": 0.0–1.0,                  "enabled": true | false },
    "delay":      { "time": 0.0–1.0,   "feedback": 0.0–1.0, "mix": 0.0–1.0, "enabled": true | false }
  },
  "master": { "gain": 0.0–1.0 },
  "sequencer": {
    "bpm": 60–180 (integer, actual BPM — NOT normalized),
    "steps": array of 8 to 64 objects (must be a multiple of 8): { "active": true|false, "note": MIDI 0–127, "velocity": 0–127 }
             Each group of 8 steps is one row. Return as many rows as the pattern needs (1–8 rows = 8–64 steps).
             Use musically meaningful MIDI notes. Bass range: C1=24, C2=36, C3=48, Middle C=60.
  }
}

Example response for a "punchy monophonic bass with a driving groove":
${JSON.stringify(EXAMPLE_PATCH, null, 2)}

Additional notes:
noiseVolume should always be 0.
noiseType should always be pink.

Now generate a patch for the following description:
`;
