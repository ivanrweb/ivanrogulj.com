import { Component } from '@angular/core';

import { TileListComponent } from '@ivanrogulj.com/tile-list';
import { TileItem } from '@ivanrogulj.com/tile-item';

@Component({
  selector: 'lib-audio-api-project-list',
  standalone: true,
  imports: [TileListComponent],
  template: `<lib-tile-list [items]="audioApiProjectList"></lib-tile-list>`,
  styles: [
    `
      :host {
        display: block;
        padding: 2rem 2rem 0 2rem;
      }
    `,
  ],
})
export class AudioApiProjectListComponent {
  public audioApiProjectList: TileItem[] = [
    {
      title: 'Analog Synth',
      description:
        'Plug & Play! Connect your MIDI device and play a fully-featured polyphonic analog synthesizer directly in your browser — no downloads required. Features up to 8 oscillators with selectable waveforms, a resonant low-pass filter with ADSR envelope, LFO modulation, and a built-in effects chain including distortion, chorus, delay, and reverb. Save your custom presets and explore patches shared by the community.',
      iconUrl: 'images/synth.svg',
      path: 'analog-synth',
    },
    {
      title: 'Guitar Pedalboard',
      description:
        'Experience real-time guitar effects powered by the Web Audio API — no installations required. Plug your guitar into any audio interface, select your input device, and start building your rig with a drag-and-drop virtual pedalboard. Stack and reorder distortion, chorus, delay, and reverb pedals in any combination. For the best low-latency experience, use Google Chrome with a dedicated audio interface.',
      iconUrl: 'images/pedalboard.svg',
      path: 'guitar-pedals',
    },
    {
      title: 'Chord Changer',
      description:
        'Paste your song lyrics and chords to instantly transpose them to any key. The tool automatically detects the current key of the song, extracts all chords, and lets you shift the entire piece up or down by any number of semitones. Supports all standard chord notations including sus, maj7, add9, and slash chords. Export the result as a formatted PDF ready to print or save them to your library if you have an account.',
      iconUrl: 'images/chord-changer.svg',
      path: 'chord-changer',
    },
    {
      title: 'PracticeJam',
      description:
        'Build your personal practice library from YouTube. Paste a link to save any video as a Jam, organize Jams into setlists, and mark the passages that need the most work as Phrases. Loop any Phrase endlessly at reduced speed — from 25% up to full tempo — until your fingers catch up. Built for musician playing any instrument learning from YouTube. Log in to keep your library.',
      iconUrl: 'images/practice-jam.svg',
      path: 'practice-jam',
    },
  ];
}
