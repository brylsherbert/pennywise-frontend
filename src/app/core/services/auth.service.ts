import { inject, Injectable } from '@angular/core';
import { AuthStore } from './store/auth.store';
import { AccountsStore } from './store/accounts.store';
import { BudgetsStore } from './store/budgets.store';
import { CategoriesStore } from './store/categories.store';
import { TransactionsStore } from './store/transactions.store';
import { UserStore } from './store/user.store';
import { UpdateUserRequest } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly userStore = inject(UserStore);
  private readonly accountsStore = inject(AccountsStore);
  private readonly budgetsStore = inject(BudgetsStore);
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly transactionsStore = inject(TransactionsStore);

  public async logout(): Promise<boolean> {
    try {
      const isLoggedOut = await this.authStore.logout();

      if (isLoggedOut) {
        this.clearSessionData();
        await this.router.navigate(['/auth']);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`[AuthService] failed to logout user: `, error);
      return false;
    }
  }

  public async getUser(): Promise<boolean> {
    try {
      const user = await this.userStore.getUser();

      if (user) {
        this.authStore.updateUser(user);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`[AuthService] failed to get user: `, error);
      return false;
    }
  }

  public async updateUser(body: UpdateUserRequest): Promise<boolean> {
    try {
      const session = await this.userStore.updateUser(body);

      if (session) {
        this.authStore.setSession(session);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`[AuthService] failed to update user: `, error);
      return false;
    }
  }

  public async deleteUser(): Promise<boolean> {
    try {
      const isDeleted = await this.userStore.deleteUser();

      if (isDeleted) {
        this.clearSessionData();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`[AuthService] failed to delete user: `, error);
      return false;
    }
  }

  private clearSessionData(): void {
    this.authStore.clearSession();
    this.accountsStore.clearAccounts();
    this.budgetsStore.clearBudgets();
    this.categoriesStore.clearCategories();
    this.transactionsStore.clearTransactions();
  }
}
