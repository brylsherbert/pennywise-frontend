import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TransactionsApi } from '../api/transactions.api';
import {
  Transaction,
  GetTransactionResponse,
  GetAllTransactionsResponse,
  GetAllTransactionsParams,
  CreateTransactionRequest,
  CreateTransactionResponse,
  UpdateTransactionRequest,
  UpdateTransactionResponse,
  DeleteTransactionResponse,
  GetAllTransactionsByBudgetIdResponse,
  GetAllTransactionsByAccountIdResponse,
} from '../../models/transactions.model';
import { API_STATUS, isApiSuccess, isApiSuccessWithData } from '../../models/api-response.model';

const TRANSACTIONS_STORAGE_KEY = 'transactions';
const DEFAULT_TRANSACTIONS_LIMIT = 10;

@Injectable({
  providedIn: 'root',
})
export class TransactionsStore {
  private readonly transactionsApi = inject(TransactionsApi);

  private _transactions = signal<Transaction[]>([]);
  private _nextCursor = signal<string | null>(null);
  private _hasMore = signal(false);
  private _loading = signal(false);

  public readonly transactions = this._transactions.asReadonly();
  public readonly nextCursor = this._nextCursor.asReadonly();
  public readonly hasMore = this._hasMore.asReadonly();
  public readonly loading = this._loading.asReadonly();

  // Public actions
  public async getAllTransactions(params?: GetAllTransactionsParams) {
    const requestParams: GetAllTransactionsParams = {
      limit: DEFAULT_TRANSACTIONS_LIMIT,
      ...params,
    };

    this._loading.set(true);

    try {
      const response: GetAllTransactionsResponse = await firstValueFrom(this.transactionsApi.getAllTransactions(requestParams));

      if (isApiSuccessWithData(response, API_STATUS.OK)) {
        this._nextCursor.set(response.pagination.nextCursor);
        this._hasMore.set(response.pagination.hasMore);

        if (!params?.cursor) {
          // first page — same as response.page === 1
          this._transactions.set(response?.data);
          this.storeTransactions(this._transactions());
        } else {
          // next pages — merge into existing list
          this._transactions.set([...this._transactions(), ...response?.data]);
        }
      }
    } catch (error) {
      console.error(`[TransactionsStore] failed to get transactions: `, error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  public async getAllTransactionsByBudgetId(id: string) {
    try {
      const response: GetAllTransactionsByBudgetIdResponse = await firstValueFrom(this.transactionsApi.getAllTransactionsByBudgetId(id));

      if (!isApiSuccessWithData(response, API_STATUS.OK)) return null;

      return response.data;
    } catch (error) {
      console.error(`[TransactionsStore] failed to get transactions by budget id: `, error);
      throw error;
    }
  }

  public async getAllTransactionsByAccountId(id: string) {
    try {
      const response: GetAllTransactionsByAccountIdResponse = await firstValueFrom(this.transactionsApi.getAllTransactionsByAccountId(id));

      if (!isApiSuccessWithData(response, API_STATUS.OK)) return null;

      return response.data;
    } catch (error) {
      console.error(`[TransactionsStore] failed to get transactions by account id: `, error);
      throw error;
    }
  }

  public async getTransactionById(id: string) {
    try {
      const response: GetTransactionResponse = await firstValueFrom(this.transactionsApi.getTransactionById(id));

      if (isApiSuccessWithData(response, API_STATUS.OK)) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error(`[TransactionsStore] failed to get transaction: `, error);
      throw error;
    }
  }

  public async createTransaction(body: CreateTransactionRequest) {
    try {
      const response: CreateTransactionResponse = await firstValueFrom(this.transactionsApi.createTransaction(body));

      if (!isApiSuccessWithData(response, API_STATUS.CREATED)) return false;

      this._transactions.update(transactions => [response.data, ...transactions]);
      return true;
    } catch (error) {
      console.error(`[TransactionsStore] failed to create transaction: `, error);
      throw error;
    }
  }

  public async updateTransaction(id: string, body: UpdateTransactionRequest) {
    try {
      const response: UpdateTransactionResponse = await firstValueFrom(this.transactionsApi.updateTransactionById(id, body));

      if (!isApiSuccessWithData(response, API_STATUS.OK)) return false;

      this._transactions.update(transactions => transactions.map(t => (t.id === id ? response.data : t)));
      return true;
    } catch (error) {
      console.error(`[TransactionsStore] failed to update transaction: `, error);
      throw error;
    }
  }

  public async deleteTransaction(id: string) {
    try {
      const response: DeleteTransactionResponse = await firstValueFrom(this.transactionsApi.deleteTransactionById(id));

      if (!isApiSuccess(response, API_STATUS.OK)) return false;

      this._transactions.update(transactions => transactions.filter(t => t.id !== id));
      return true;
    } catch (error) {
      console.error(`[TransactionsStore] failed to delete transaction: `, error);
      throw error;
    }
  }

  public async initializeTransactionsFromStorage() {
    this.clearPagination();

    const transactions: Transaction[] = this.getTransactionsFromStorage();

    if (transactions?.length > 0) {
      this.storeTransactions(transactions);
      void this.getAllTransactions();
    } else {
      await this.getAllTransactions();
    }
  }

  public clearTransactions() {
    localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
    this._transactions.set([]);
    this.clearPagination();
  }

  // Private helpers
  private storeTransactions(transactions: Transaction[]) {
    this._transactions.set(transactions);
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  }

  private getTransactionsFromStorage(): Transaction[] {
    try {
      const rawStorage = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (!rawStorage) return [];

      const parsedStorage = JSON.parse(rawStorage);
      if (parsedStorage?.length > 0) return parsedStorage as Transaction[];

      return [];
    } catch (error) {
      localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
      return [];
    }
  }

  private clearPagination() {
    this._hasMore.set(false);
    this._nextCursor.set(null);
  }
}