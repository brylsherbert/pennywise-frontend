// features/auth/auth.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/auth-page/auth-page.component').then((m) => m.AuthPageComponent),
  },
  {
    path: 'login',
    redirectTo: '/auth',
  },
  {
    path: 'register',
    redirectTo: '/auth',
  },
];