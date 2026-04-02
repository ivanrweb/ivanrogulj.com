import { Injectable } from '@angular/core';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';

@Injectable({ providedIn: 'root' })
export class GuitarAudioService {
  private audioContext: AudioContext | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private inputGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private currentStream: MediaStream | null = null;
  private activeEffects: AnalogSynthApi.SynthEffect[] = [];

  public async getAvailableInputs(): Promise<MediaDeviceInfo[]> {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === 'audioinput');
  }

  public getLatencyInfo(): { baseMs: number; outputMs: number; totalMs: number } | null {
    if (!this.audioContext) return null;
    const baseMs = (this.audioContext.baseLatency ?? 0) * 1000;
    const outputMs = (this.audioContext.outputLatency ?? 0) * 1000;
    return { baseMs, outputMs, totalMs: baseMs + outputMs };
  }

  public async initialize(deviceId?: string, latencyHint: AudioContextLatencyCategory = 'interactive', sampleRate = 44100): Promise<void> {
    if (this.audioContext) {
      await this.stop();
    }

    this.audioContext = new AudioContext({
      sampleRate,
      latencyHint,
    });

    const constraints: MediaStreamConstraints = {
      audio: deviceId
        ? {
            deviceId: { exact: deviceId },
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          }
        : {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
    };

    this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.currentStream);

    // Guitar input is mono — duplicate to both L and R channels before the effects chain
    const monoToStereo = this.audioContext.createChannelMerger(2);
    this.mediaStreamSource.connect(monoToStereo, 0, 0);
    this.mediaStreamSource.connect(monoToStereo, 0, 1);

    this.inputGain = this.audioContext.createGain();
    this.inputGain.gain.value = 1.0;
    monoToStereo.connect(this.inputGain);

    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 1.0;

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.masterGain.connect(this.audioContext.destination);
  }

  public getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  public getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setInputGain(value: number): void {
    if (this.inputGain) {
      this.inputGain.gain.setTargetAtTime(value, this.audioContext!.currentTime, 0.01);
    }
  }

  public setMasterVolume(value: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(value, this.audioContext!.currentTime, 0.01);
    }
  }

  public setChain(effects: AnalogSynthApi.SynthEffect[]): void {
    if (!this.inputGain || !this.compressor) return;

    // Disconnect all active effects
    this.activeEffects.forEach((e) => e.disconnect());
    this.inputGain.disconnect();

    this.activeEffects = effects;

    if (effects.length === 0) {
      this.inputGain.connect(this.compressor);
      return;
    }

    this.inputGain.connect(effects[0].input);
    for (let i = 0; i < effects.length - 1; i++) {
      effects[i].output.connect(effects[i + 1].input);
    }
    effects[effects.length - 1].output.connect(this.compressor);
  }

  public async stop(): Promise<void> {
    this.activeEffects.forEach((e) => e.disconnect());
    this.activeEffects = [];

    if (this.currentStream) {
      this.currentStream.getTracks().forEach((t) => t.stop());
      this.currentStream = null;
    }
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    this.mediaStreamSource = null;
    this.inputGain = null;
    this.compressor = null;
    this.masterGain = null;
    this.analyser = null;
  }
}
