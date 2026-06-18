import { inject, Injectable } from '@angular/core';
import { AuthStore } from './store/auth.store';
import { AccountsStore } from './store/accounts.store';
import { BudgetsStore } from './store/budgets.store';
import { CategoriesStore } from './store/categories.store';
import { TransactionsStore } from './store/transactions.store';

@Injectable({
  providedIn: 'root',
})
export class AppBootstrapService {
  private readonly accountsStore = inject(AccountsStore);
  private readonly budgetsStore = inject(BudgetsStore);
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly transactionsStore = inject(TransactionsStore);

  async initializeAppData() {
    await Promise.all([
      this.accountsStore.initializeAccountsFromStorage(),
      this.budgetsStore.initializeBudgetsFromStorage(),
      this.budgetsStore.initializeBudgetSummaryFromStorage(),
      this.categoriesStore.initializeCategoriesFromStorage(),
      this.transactionsStore.initializeTransactionsFromStorage(),
    ]);
  }
}
