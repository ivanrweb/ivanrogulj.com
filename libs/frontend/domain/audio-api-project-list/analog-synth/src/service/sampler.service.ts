import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { SAMPLER_PRESETS } from '../config/sampler-presets.config';

export interface NearestBuffer {
  buffer: AudioBuffer;
  /** Semitones above (+) or below (-) the requested note */
  semitoneOffset: number;
}

@Injectable({ providedIn: 'root' })
export class SamplerService {
  private readonly cache = new Map<string, Map<number, AudioBuffer>>();

  public loadPreset(
    presetId: string,
    audioCtx: AudioContext
  ): Observable<void> {
    if (this.cache.has(presetId)) {
      return of(undefined);
    }

    // Evict last preset — save only currently selected in RAM
    this.cache.clear();

    const config = SAMPLER_PRESETS[presetId];
    if (!config) {
      console.warn(`SamplerService: unknown preset "${presetId}"`);
      return of(undefined);
    }

    const ext = config.fileExtension ?? 'ogg';
    const fileNameFn = config.fileNameFn ?? ((note: number) => String(note));
    const [minNote, maxNote] = config.midiRange;
    const noteNumbers: number[] = [];
    for (let n = minNote; n <= maxNote; n++) {
      noteNumbers.push(n);
    }

    const noteMap = new Map<number, AudioBuffer>();

    const loadAll = Promise.all(
      noteNumbers.map(async (note) => {
        const url = `${config.assetPath}/${fileNameFn(note)}.${ext}`;
        try {
          const response = await fetch(url);
          if (!response.ok) return;
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          noteMap.set(note, audioBuffer);
        } catch {
          // Missing sample for this note — silently skip
        }
      })
    ).then(() => {
      this.cache.set(presetId, noteMap);
    });

    return from(loadAll);
  }

  /**
   * Returns the buffer for the exact note, or null if not loaded.
   * Use getNearestBuffer() for nearest-neighbour fallback with pitch correction.
   */
  public getBuffer(presetId: string, note: number): AudioBuffer | null {
    return this.cache.get(presetId)?.get(note) ?? null;
  }

  /**
   * Returns the nearest loaded buffer and the semitone offset needed to
   * transpose it back to the requested note via playbackRate.
   */
  public getNearestBuffer(
    presetId: string,
    note: number
  ): NearestBuffer | null {
    const noteMap = this.cache.get(presetId);
    if (!noteMap || noteMap.size === 0) return null;

    const exactBuffer = noteMap.get(note);
    if (exactBuffer) return { buffer: exactBuffer, semitoneOffset: 0 };

    let nearestNote = -1;
    let minDist = Infinity;
    for (const [n] of noteMap) {
      const dist = Math.abs(n - note);
      if (dist < minDist) {
        minDist = dist;
        nearestNote = n;
      }
    }

    if (nearestNote < 0) return null;
    return {
      buffer: noteMap.get(nearestNote)!,
      semitoneOffset: note - nearestNote,
    };
  }

  public isLoaded(presetId: string): boolean {
    return this.cache.has(presetId);
  }
}
