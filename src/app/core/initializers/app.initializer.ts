import { inject, Injectable } from '@angular/core';
import { AuthStore } from '../services/store/auth.store';
import { AccountsStore } from '../services/store/accounts.store';
import { BudgetsStore } from '../services/store/budgets.store';
import { CategoriesStore } from '../services/store/categories.store';
import { TransactionsStore } from '../services/store/transactions.store';

@Injectable({
  providedIn: 'root',
})
export class AppInitializer {
  private readonly authStore = inject(AuthStore);
  private readonly accountsStore = inject(AccountsStore);
  private readonly budgetsStore = inject(BudgetsStore);
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly transactionsStore = inject(TransactionsStore);

  async initializeApp(): Promise<void> {
    this.authStore.initializeAuthDataFromStorage();

    if (!this.authStore.isAuthenticated()) {
      return;
    }

    await Promise.all([
      this.accountsStore.initializeAccountsFromStorage(),
      this.budgetsStore.initializeBudgetsFromStorage(),
      this.categoriesStore.initializeCategoriesFromStorage(),
      this.transactionsStore.initializeTransactionsFromStorage(),
    ]);
  }
}