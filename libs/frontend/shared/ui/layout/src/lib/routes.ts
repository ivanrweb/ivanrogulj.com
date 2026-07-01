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
    path: 'audio',
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
        path: 'guitar-pedals',
        loadComponent: () =>
          import('@ivanrogulj.com/guitar-pedals').then(
            (m) => m.GuitarPedalsComponent
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
  {
    path: 'articles',
    loadComponent: () =>
      import('@ivanrogulj.com/blog').then((m) => m.BlogListComponent),
  },
  {
    path: 'articles/:slug',
    loadComponent: () =>
      import('@ivanrogulj.com/blog').then((m) => m.ArticleDetailComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('@ivanrogulj.com/about').then((m) => m.AboutComponent),
  },
  {
    path: 'patreon',
    loadComponent: () =>
      import('./patreon.component').then((m) => m.PatreonComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@ivanrogulj.com/auth').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('@ivanrogulj.com/auth').then((m) => m.RegisterComponent),
  },
  {
    path: 'email-confirmed',
    loadComponent: () =>
      import('@ivanrogulj.com/auth').then((m) => m.EmailConfirmedComponent),
  },
];
