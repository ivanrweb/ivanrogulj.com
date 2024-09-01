import { Route } from '@angular/router';
import { LayoutComponent, routes } from '@ivanrogulj.com/layout';

export const appRoutes: Route[] = [

  // {
  //   path: '',
  //   loadComponent: () =>
  //     import('@ivanrogulj.com/layout').then(m => m.LayoutComponent),
  //   children: [
  //     {
  //       path: '',
  //       loadChildren: () => import('@ivanrogulj.com/layout').then(m => m.routes),
  //     },
  //   ]
  // },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@ivanrogulj.com/layout').then(m => m.routes),
      },
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('@ivanrogulj.com/not-found').then(m => m.NotFoundComponent),
  }
];
