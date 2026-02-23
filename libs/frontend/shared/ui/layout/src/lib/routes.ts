import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full', // Matches empty path to render default child route
    loadComponent: () =>
      import('@ivanrogulj.com/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('@ivanrogulj.com/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'synths',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@ivanrogulj.com/audio-api-project-list').then(
            (m) => m.AudioApiProjectListComponent
          ),
      },
      {
        path: 'analog-synth',
        loadComponent: () =>
          import('@ivanrogulj.com/analog-synth').then(
            (m) => m.AnalogSynthComponent
          ),
      },
      {
        path: 'modular-synth',
        loadComponent: () =>
          import('@ivanrogulj.com/modular-synth').then(
            (m) => m.ModularSynthComponent
          ),
      },
      {
        path: 'chord-changer',
        loadComponent: () =>
          import('@ivanrogulj.com/chord-changer').then(
            (m) => m.ChordChangerComponent
          ),
      },
    ],
  },

  {
    path: 'juce',
    loadComponent: () =>
      import('@ivanrogulj.com/juce-project-list').then(
        (m) => m.JuceProjectListComponent
      ),
  },
];
