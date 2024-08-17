import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full', // Matches empty path to render default child route
    loadComponent: () =>
      import('@ivanrogulj.com/dashboard').then(m => m.DashboardComponent),
  },
  {
    path: 'audio-api-projects',
    loadComponent: () =>
      import('@ivanrogulj.com/audio-api-project-list').then(m => m.AudioApiProjectListComponent),
  },
  {
    path: 'juce-projects',
    loadComponent: () =>
      import('@ivanrogulj.com/juce-project-list').then(m => m.JuceProjectListComponent),
  }
];
