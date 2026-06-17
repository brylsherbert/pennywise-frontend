import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.routes),
  },
  {
    path: '',
    loadChildren: () => import('./layout/tabs/tabs.routes').then((m) => m.routes),
  },
];
