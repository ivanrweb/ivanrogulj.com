import { inject, Injectable } from '@angular/core';
import {
  KeyProbability,
  KeyProbabilityService,
} from './key-probability.service';

export interface ChordAnalysis {
  transposedText: string;
  uniqueChords: string[];
  progression: string[];
  probableKeys: KeyProbability[];
}

@Injectable({ providedIn: 'root' })
export class ChordChangerService {
  private keyProbabilityService = inject(KeyProbabilityService);

  private readonly notes = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ];

  // Matches complex jazz chords including extensions, alterations, and slash chords.
  private readonly chordRegex =
    /^([CDEFGAHB])([#b]?)(m|M|maj|min|dim|aug|sus|add|\+|-|o|ø|Δ)?(\d{0,2})((?:[#b+-]\d{1,2}|sus\d?|add\d{1,2}|\(.*\))*)(\/[CDEFGAHB][#b]?)?$/;
  private readonly inlineChordRegex = /\[([^\]]+)\]/g;

  public processText(text: string, semitones: number): ChordAnalysis {
    if (!text || text.trim() === '') {
      return {
        transposedText: '',
        uniqueChords: [],
        progression: [],
        probableKeys: [],
      };
    }

    const useH = this.detectHUsage(text);

    const lines = text.split('\n');
    const processedLines: string[] = [];
    const foundChords = new Set<string>();
    const orderedChords: string[] = [];

    for (const line of lines) {
      if (this.isChordLine(line)) {
        const transposedLine = this.transposeLine(
          line,
          semitones,
          useH,
          foundChords,
          orderedChords
        );
        processedLines.push(transposedLine);
      } else {
        const transposedInline = line.replace(
          this.inlineChordRegex,
          (match, chordInner) => {
            if (this.isValidChord(chordInner.trim())) {
              const transposed = this.transposeChord(
                chordInner.trim(),
                semitones,
                useH
              );
              foundChords.add(transposed);
              orderedChords.push(transposed);
              return `[${transposed}]`;
            }
            return match;
          }
        );
        processedLines.push(transposedInline);
      }
    }

    const uniqueChords = Array.from(foundChords);

    // Delegation of heuristic key analysis to the specialized service
    const probableKeys = this.keyProbabilityService.detectKeyProbabilities(
      orderedChords,
      useH
    );

    const topKey = probableKeys.length > 0 ? probableKeys[0].name : '';
    // Use the probability service to calculate progression
    const progression = this.keyProbabilityService.calculateProgression(
      uniqueChords,
      topKey
    );

    return {
      transposedText: processedLines.join('\n'),
      uniqueChords,
      progression,
      probableKeys,
    };
  }

  private detectHUsage(text: string): boolean {
    const tokens = text.split(/[\s|\[\]]+/);
    for (const t of tokens) {
      if (t.startsWith('H') && this.isValidChord(t)) {
        return true;
      }
    }
    return false;
  }

  private isChordLine(line: string): boolean {
    const trimmed = line.trim();
    if (trimmed.length === 0) return false;

    const tokens = trimmed.split(/[\s|\[\]]+/).filter((t) => t.length > 0);
    if (tokens.length === 0) return false;

    let validChordCount = 0;
    for (const token of tokens) {
      if (this.isValidChord(token)) {
        validChordCount++;
      }
    }

    const ratio = validChordCount / tokens.length;
    return ratio >= 0.6;
  }

  private isValidChord(token: string): boolean {
    return this.chordRegex.test(token);
  }

  private transposeLine(
    line: string,
    semitones: number,
    useH: boolean,
    foundChords: Set<string>,
    orderedChords: string[]
  ): string {
    const tokenRegex = /([^ \t\|\[\]]+)/g;

    return line.replace(tokenRegex, (match) => {
      if (this.isValidChord(match)) {
        const transposed = this.transposeChord(match, semitones, useH);
        foundChords.add(transposed);
        orderedChords.push(transposed);

        const diff = match.length - transposed.length;
        return transposed + (diff > 0 ? ' '.repeat(diff) : '');
      }
      return match;
    });
  }

  private transposeChord(chord: string, steps: number, useH: boolean): string {
    const match = chord.match(this.chordRegex);
    if (!match) return chord;

    const root = match[1];
    const accidental = match[2] || '';
    const modifier = match[3] || '';
    const num = match[4] || '';
    const extensions = match[5] || '';
    const bass = match[6] || '';

    const newRoot = this.transposeNote(root + accidental, steps, useH);

    let newBass = '';
    if (bass) {
      const bassNote = bass.substring(1);
      newBass = '/' + this.transposeNote(bassNote, steps, useH);
    }

    return newRoot + modifier + num + extensions + newBass;
  }

  private transposeNote(note: string, steps: number, useH: boolean): string {
    let normalizedNote = note;

    if (normalizedNote.startsWith('H')) {
      normalizedNote = 'B' + normalizedNote.substring(1);
    }

    if (normalizedNote.length === 2 && normalizedNote[1] === 'b') {
      if (normalizedNote === 'Bb') {
        normalizedNote = 'A#';
      } else {
        const flatIndex = this.notes.indexOf(normalizedNote[0]);
        const sharpIndex = (flatIndex - 1 + 12) % 12;
        normalizedNote = this.notes[sharpIndex];
      }
    }

    const currentIndex = this.notes.indexOf(normalizedNote);
    if (currentIndex === -1) return note;

    const newIndex = (currentIndex + steps + 120) % 12;
    let transposed = this.notes[newIndex];

    if (useH && transposed === 'B') {
      transposed = 'H';
    }

    return transposed;
  }
}
