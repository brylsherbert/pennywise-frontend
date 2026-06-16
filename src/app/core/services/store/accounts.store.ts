import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AccountsApi } from '../api/accounts.api';
import { Account, GetAccountResponse, GetAllAccountsResponse, GetAllAccountsParams, CreateAccountRequest, CreateAccountResponse, UpdateAccountRequest, UpdateAccountResponse, DeleteAccountResponse } from '../../models/accounts.model';
import { API_STATUS, isApiSuccess, isApiSuccessWithData } from '../../models/api-response.model';

const ACCOUNTS_STORAGE_KEY = 'accounts';
const DEFAULT_ACCOUNTS_LIMIT = 10;

@Injectable({
  providedIn: 'root',
})
export class AccountsStore {
  private readonly accountsApi = inject(AccountsApi);

  private _accounts = signal<Account[]>([]);
  private _nextCursor = signal<string | null>(null);
  private _hasMore = signal(false);
  private _loading = signal(false);

  public readonly accounts = this._accounts.asReadonly();
  public readonly nextCursor = this._nextCursor.asReadonly();
  public readonly hasMore = this._hasMore.asReadonly();
  public readonly loading = this._loading.asReadonly();

  // Public actions
  public async getAllAccounts(params?: GetAllAccountsParams) {
    const requestParams: GetAllAccountsParams = {
      limit: DEFAULT_ACCOUNTS_LIMIT,
      ...params,
    };

    this._loading.set(true);

    try {
      const response: GetAllAccountsResponse = await firstValueFrom(this.accountsApi.getAllAccounts(requestParams));

      if (isApiSuccessWithData(response, API_STATUS.OK)) {
        this._nextCursor.set(response.pagination.nextCursor);
        this._hasMore.set(response.pagination.hasMore);

        if (!params?.cursor) {
          // first page — same as response.page === 1
          this._accounts.set(response?.data);
          this.storeAccounts(this._accounts());
        } else {
          // next pages — merge into existing list
          this._accounts.set([...this._accounts(), ...response?.data]);
        }
      }
    } catch (error) {
      console.error(`[AccountsStore] failed to get accounts: `, error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  public async getAccountById(id: string) {
    try {
      const response: GetAccountResponse = await firstValueFrom(this.accountsApi.getAccountById(id));

      if (isApiSuccessWithData(response, API_STATUS.OK)) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error(`[AccountsStore] failed to get account: `, error);
      throw error;
    }
  }

  public async createAccount(body: CreateAccountRequest) {
    try {
      const response: CreateAccountResponse = await firstValueFrom(this.accountsApi.createAccount(body));

      if (!isApiSuccessWithData(response, API_STATUS.CREATED)) return false;

      this._accounts.update(accounts => [response.data, ...accounts]);
      return true;
    } catch (error) {
      console.error(`[AccountsStore] failed to create account: `, error);
      throw error;
    }
  }

  public async updateAccount(id: string, body: UpdateAccountRequest) {
    try {
      const response: UpdateAccountResponse = await firstValueFrom(this.accountsApi.updateAccountById(id, body));

      if (!isApiSuccessWithData(response, API_STATUS.OK)) return false;

      this._accounts.update(accounts => accounts.map(a => (a.id === id ? response.data : a)));
      return true;
    } catch (error) {
      console.error(`[AccountsStore] failed to update account: `, error);
      throw error;
    }
  }

  public async deleteAccount(id: string) {
    try {
      const response: DeleteAccountResponse = await firstValueFrom(this.accountsApi.deleteAccountById(id));

      if (!isApiSuccess(response, API_STATUS.OK)) return false;

      this._accounts.update(accounts => accounts.filter(a => a.id !== id));
      return true;
    } catch (error) {
      console.error(`[AccountsStore] failed to delete account: `, error);
      throw error;
    }
  }

  public async initializeAccountsFromStorage() {
    this.clearPagination();

    const accounts: Account[] = this.getAccountsFromStorage();

    if (accounts?.length > 0) {
      this.storeAccounts(accounts);
      void this.getAllAccounts();
    } else {
      await this.getAllAccounts();
    }
  }

  public clearAccounts() {
    localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
    this._accounts.set([]);
    this.clearPagination();
  }

  // Private helpers
  private storeAccounts(accounts: Account[]) {
    this._accounts.set(accounts);
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  }

  private getAccountsFromStorage(): Account[] {
    try {
      const rawStorage = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (!rawStorage) return [];

      const parsedStorage = JSON.parse(rawStorage);
      if (parsedStorage?.length > 0) return parsedStorage as Account[];

      return [];
    } catch (error) {
      localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
      return [];
    }
  }

  private clearPagination() {
    this._hasMore.set(false);
    this._nextCursor.set(null);
  }
}