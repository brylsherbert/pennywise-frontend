import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: '/budgets',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/budgets',
    pathMatch: 'full',
  },
];
