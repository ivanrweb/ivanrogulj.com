import { Route } from '@angular/router';
import { LayoutComponent } from '@ivanrogulj.com/layout';

export const appRoutes: Route[] = [

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
    redirectTo: ''
  }
];
