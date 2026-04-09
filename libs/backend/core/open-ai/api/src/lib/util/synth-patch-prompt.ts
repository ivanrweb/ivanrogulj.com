import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

const EXAMPLE_PATCH: AnalogSynthApi.FullSynthPatchJson = {
  oscillator: {
    type: 'sawtooth',
    count: 2,
    detune: 0.3,
    isPolyphonic: true,
    noiseType: 'white',
    noiseVolume: 0.05,
  },
  filter: {
    frequency: 0.45,
    resonance: 0.3,
    envelopeAmount: 0.5,
  },
  volumeEnvelope: {
    attack: 0.05,
    decay: 0.2,
    sustain: 0.7,
    release: 0.4,
  },
  filterEnvelope: {
    attack: 0.08,
    decay: 0.25,
    sustain: 0.5,
    release: 0.3,
  },
  lfo1: {
    rate: 0.3,
    depth: 0.2,
    waveform: 'sine',
    destination: 'filterCutoff',
    keySync: false,
    enabled: true,
  },
  lfo2: {
    rate: 0.1,
    depth: 0.05,
    waveform: 'sine',
    destination: 'none',
    keySync: false,
    enabled: false,
  },
  effects: {
    distortion: { amount: 0.0, tone: 0.5, mix: 0.0, enabled: false },
    chorus: { rate: 0.4, depth: 0.3, mix: 0.2, enabled: true },
    reverb: { mix: 0.25, decay: 0.5, enabled: true },
    delay: { time: 0.4, feedback: 0.3, mix: 0.15, enabled: false },
  },
  master: {
    gain: 0.8,
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
    "rate": 0.0–1.0,
    "depth": 0.0–1.0,
    "waveform": "sine" | "square" | "sawtooth" | "triangle",
    "destination": "none" | "filterCutoff" | "pitch" | "volume" | "delayTime",
    "keySync": true | false,
    "enabled": true | false
  },
  "lfo2": { (same structure as lfo1) },
  "effects": {
    "distortion": { "amount": 0.0–1.0, "tone": 0.0–1.0, "mix": 0.0–1.0, "enabled": true | false },
    "chorus":     { "rate": 0.0–1.0,   "depth": 0.0–1.0, "mix": 0.0–1.0, "enabled": true | false },
    "reverb":     { "mix": 0.0–1.0,    "decay": 0.0–1.0,                  "enabled": true | false },
    "delay":      { "time": 0.0–1.0,   "feedback": 0.0–1.0, "mix": 0.0–1.0, "enabled": true | false }
  },
  "master": { "gain": 0.0–1.0 }
}

Example response for a "warm pad with slow attack":
${JSON.stringify(EXAMPLE_PATCH, null, 2)}

Now generate a patch for the following description:
`;
