import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth',
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth').then((m) => m.AuthPage),
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];
