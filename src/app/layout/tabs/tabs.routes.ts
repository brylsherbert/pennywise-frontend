import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'budgets',
        loadComponent: () =>
          import('../../pages/budgets-page/budgets-page.component').then((m) => m.BudgetsPageComponent),
      },
      {
        path: 'budgets/:budgetId',
        loadComponent: () =>
          import('../../pages/budget-transactions-page/budget-transactions-page.component').then(
            (m) => m.BudgetTransactionsPageComponent,
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('../../pages/transactions-page/transactions-page.component').then((m) => m.TransactionsPageComponent),
      },
      {
        path: 'accounts',
        loadComponent: () =>
          import('../../pages/accounts-page/accounts-page.component').then((m) => m.AccountsPageComponent),
      },
      {
        path: 'accounts/:accountId',
        loadComponent: () =>
          import('../../pages/account-transactions-page/account-transactions-page.component').then(
            (m) => m.AccountTransactionsPageComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('../../pages/reports-page/reports-page.component').then((m) => m.ReportsPageComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../../pages/settings-page/settings-page.component').then((m) => m.SettingsPageComponent),
      },
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
