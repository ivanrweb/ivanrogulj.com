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
        padding: 2rem 0 0 2rem;
      }
    `,
  ],
})
export class AudioApiProjectListComponent {
  public audioApiProjectList: TileItem[] = [
    {
      title: 'Analog Synth',
      subtitle: '3 oscillators, filter and envelopes',
      iconUrl:
        'https://images.unsplash.com/photo-1721332149346-00e39ce5c24f?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      path: 'analog-synth',
    },
    {
      title: 'Guitar Pedalboard',
      subtitle: 'Real-time guitar effects with virtual pedalboard',
      iconUrl:
        'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1470&auto=format&fit=crop',
      path: 'guitar-pedals',
    },
    {
      title: 'Chord changer',
      subtitle: 'Paste song and transpose tonality',
      iconUrl:
        'https://images.unsplash.com/photo-1721332149346-00e39ce5c24f?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      path: 'chord-changer',
    },
  ];
}
