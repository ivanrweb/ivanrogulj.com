import { Injectable } from '@angular/core';

export interface KeyProbability {
  name: string;
  probability: number;
}

@Injectable({ providedIn: 'root' })
export class KeyProbabilityService {
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

  // Evaluates chords against 24 keys, scoring cadences and diatonic relationships.
  public detectKeyProbabilities(
    orderedChords: string[],
    useH: boolean
  ): KeyProbability[] {
    if (orderedChords.length === 0) return [];

    const parsedChords = orderedChords.map((c) => this.parseBasicChord(c));
    const allKeys: { rootIndex: number; isMinor: boolean; name: string }[] = [];

    for (let i = 0; i < 12; i++) {
      allKeys.push({ rootIndex: i, isMinor: false, name: this.notes[i] });
      allKeys.push({ rootIndex: i, isMinor: true, name: this.notes[i] + 'm' });
    }

    const results = allKeys.map((key) => {
      let score = 0;

      for (let i = 0; i < parsedChords.length; i++) {
        const chord = parsedChords[i];
        const chordRootIndex = this.notes.indexOf(chord.root);
        if (chordRootIndex === -1) continue;

        const interval = (chordRootIndex - key.rootIndex + 12) % 12;

        // Check if the chord naturally belongs to the tested key (diatonic).
        let isDiatonic = false;
        if (!key.isMinor) {
          if (
            (interval === 0 && chord.quality === 'M') ||
            (interval === 2 && chord.quality === 'm') ||
            (interval === 4 && chord.quality === 'm') ||
            (interval === 5 && chord.quality === 'M') ||
            (interval === 7 && chord.quality === 'M') ||
            (interval === 9 && chord.quality === 'm') ||
            (interval === 11 && chord.quality === 'dim')
          ) {
            isDiatonic = true;
          }
        } else {
          if (
            (interval === 0 && chord.quality === 'm') ||
            (interval === 2 && chord.quality === 'dim') ||
            (interval === 3 && chord.quality === 'M') ||
            (interval === 5 && chord.quality === 'm') ||
            (interval === 7 &&
              (chord.quality === 'm' || chord.quality === 'M')) ||
            (interval === 8 && chord.quality === 'M') ||
            (interval === 10 && chord.quality === 'M')
          ) {
            isDiatonic = true;
          }
        }

        if (isDiatonic) score += 10;

        // Reward if the chord is the root (tonic) of the tested key.
        if (
          interval === 0 &&
          ((!key.isMinor && chord.quality === 'M') ||
            (key.isMinor && chord.quality === 'm'))
        ) {
          score += 5;
        }

        // Detect strong V-I cadences (dominant to tonic resolution).
        if (i < parsedChords.length - 1) {
          const nextChord = parsedChords[i + 1];
          const nextRootIndex = this.notes.indexOf(nextChord.root);
          const nextInterval = (nextRootIndex - key.rootIndex + 12) % 12;

          if (interval === 7 && nextInterval === 0) {
            const validV = chord.quality === 'M' || chord.isV7;
            const validI =
              (!key.isMinor && nextChord.quality === 'M') ||
              (key.isMinor && nextChord.quality === 'm');
            if (validV && validI) score += 30;
          }
        }
      }

      // Reward keys that match the first or last chord, as songs often start/end on the tonic.
      const first = parsedChords[0];
      const firstRootIdx = this.notes.indexOf(first.root);
      if (
        firstRootIdx === key.rootIndex &&
        ((!key.isMinor && first.quality === 'M') ||
          (key.isMinor && first.quality === 'm'))
      ) {
        score += 15;
      }

      const last = parsedChords[parsedChords.length - 1];
      const lastRootIdx = this.notes.indexOf(last.root);
      if (
        lastRootIdx === key.rootIndex &&
        ((!key.isMinor && last.quality === 'M') ||
          (key.isMinor && last.quality === 'm'))
      ) {
        score += 25;
      }

      return { name: key.name, score };
    });

    // Square the scores to penalize weak matches and heavily reward strong ones.
    results.forEach((r) => (r.score = Math.pow(r.score, 2)));

    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    if (totalScore === 0) return [];

    return results
      .map((r) => {
        let dispName = r.name;
        if (useH && dispName.startsWith('B')) {
          dispName = 'H' + dispName.substring(1);
        }
        return {
          name: dispName,
          probability: Math.round((r.score / totalScore) * 100),
        };
      })
      .filter((r) => r.probability > 0)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);
  }

  // Translates a sequence of chords into Roman numeral analysis based on a given key.
  public calculateProgression(chords: string[], keyChord: string): string[] {
    if (!keyChord || chords.length === 0) return [];

    const keyMatch = keyChord.match(/^([CDEFGAHB][#b]?)(.*)$/);
    if (!keyMatch) return [];

    const keyRoot = this.normalizeNote(keyMatch[1]);
    const keyIndex = this.notes.indexOf(keyRoot);

    return chords.map((chord) => {
      const match = chord.match(/^([CDEFGAHB][#b]?)(.*)$/);
      if (!match) return chord;

      const root = this.normalizeNote(match[1]);
      const modifier = match[2] || '';
      const chordIndex = this.notes.indexOf(root);

      const interval = (chordIndex - keyIndex + 12) % 12;
      const isMinor =
        modifier.startsWith('m') &&
        !modifier.startsWith('maj') &&
        !modifier.startsWith('M');

      return this.getRomanNumeral(interval, isMinor);
    });
  }

  // Strips extensions to classify base chord quality (Major, Minor, Diminished).
  private parseBasicChord(chord: string): {
    root: string;
    quality: string;
    isV7: boolean;
  } {
    const match = chord.match(
      /^([CDEFGAHB][#b]?)(m|M|maj|min|dim|aug|sus|add|\+|-|o|ø|Δ)?(\d{0,2})/
    );
    if (!match) return { root: chord, quality: 'M', isV7: false };

    const root = this.normalizeNote(match[1]);
    let quality = 'M';
    let isV7 = false;
    const mod = match[2] || '';
    const num = match[3] || '';

    if (mod.startsWith('m') && !mod.startsWith('maj') && !mod.startsWith('M')) {
      quality = 'm';
      if (mod === 'm' && num === '7' && chord.includes('b5')) {
        quality = 'dim';
      }
    } else if (mod === 'dim' || mod === 'o' || mod === 'ø') {
      quality = 'dim';
    } else if (mod === 'aug' || mod === '+') {
      quality = 'aug';
    }

    if (
      quality === 'M' &&
      num === '7' &&
      mod !== 'maj' &&
      mod !== 'M' &&
      mod !== 'Δ'
    ) {
      isV7 = true;
    }

    return { root, quality, isV7 };
  }

  private normalizeNote(note: string): string {
    let n = note;
    if (n.startsWith('H')) {
      n = 'B' + n.substring(1);
    }
    if (n.length === 2 && n[1] === 'b') {
      if (n === 'Bb') return 'A#';
      const flatIndex = this.notes.indexOf(n[0]);
      return this.notes[(flatIndex - 1 + 12) % 12];
    }
    return n;
  }

  private getRomanNumeral(interval: number, isMinor: boolean): string {
    const numerals = [
      'I',
      'bII',
      'II',
      'bIII',
      'III',
      'IV',
      'bV',
      'V',
      'bVI',
      'VI',
      'bVII',
      'VII',
    ];
    let roman = numerals[interval];
    if (isMinor) {
      roman = roman.toLowerCase();
    }
    return roman;
  }
}
