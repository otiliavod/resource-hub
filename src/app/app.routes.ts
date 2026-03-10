import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard/dashboard';
import { authGuard } from './data/auth.guard';

export const appRoutes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth').then((m) => m.AuthPage),
  },
  {
    path: 'dashboard',
    component: DashboardPage,
    canActivate: [authGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];
