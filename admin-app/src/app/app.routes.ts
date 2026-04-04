import { Route } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        m => m.DashboardComponent,
      ),
  },
  {
    path: 'articles',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/articles/article-list.component').then(
        m => m.ArticleListComponent,
      ),
  },
  {
    path: 'articles/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/articles/article-form.component').then(
        m => m.ArticleFormComponent,
      ),
  },
  {
    path: 'articles/edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/articles/article-form.component').then(
        m => m.ArticleFormComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
