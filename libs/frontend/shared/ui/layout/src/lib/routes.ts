import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full', // Matches empty path to render default child route
    loadComponent: () =>
      import('@ivanrogulj.com/dashboard').then(m => m.DashboardComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('@ivanrogulj.com/dashboard').then(m => m.DashboardComponent),
  },
  {
    path: 'synths',
    loadComponent: () =>
      import('@ivanrogulj.com/audio-api-project-list').then(m => m.AudioApiProjectListComponent),
    children: [
      {
        path: 'modular-synth',
        loadComponent: () =>
          import('@ivanrogulj.com/modular-synth').then(m => m.ModularSynthComponent),
      }
    ]
  },
  {
    path: 'juce',
    loadComponent: () =>
      import('@ivanrogulj.com/juce-project-list').then(m => m.JuceProjectListComponent),
  }
];
