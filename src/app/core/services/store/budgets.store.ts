import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BudgetsApi } from '../api/budgets.api';
import {
  Budget,
  GetBudgetResponse,
  GetAllBudgetsResponse,
  GetAllBudgetsParams,
  CreateBudgetRequest,
  CreateBudgetResponse,
  UpdateBudgetRequest,
  UpdateBudgetResponse,
  DeleteBudgetResponse,
  GetBudgetSummaryResponse,
  BudgetSummary
} from '../../models/budgets.model';
import { API_STATUS, isApiSuccess, isApiSuccessWithData } from '../../models/api-response.model';

const BUDGETS_STORAGE_KEY = 'budgets';
const DEFAULT_BUDGETS_LIMIT = 10;

@Injectable({
  providedIn: 'root',
})
export class BudgetsStore {
  private readonly budgetsApi = inject(BudgetsApi);

  private _budgets = signal<Budget[]>([]);
  private _budgetSummary = signal<BudgetSummary | null>(null);
  private _nextCursor = signal<string | null>(null);
  private _hasMore = signal(false);
  private _loading = signal(false);

  public readonly budgets = this._budgets.asReadonly();
  public readonly budgetSummary = this._budgetSummary.asReadonly();
  public readonly nextCursor = this._nextCursor.asReadonly();
  public readonly hasMore = this._hasMore.asReadonly();
  public readonly loading = this._loading.asReadonly();

  // Public actions
  public async getAllBudgets(params?: GetAllBudgetsParams) {
    const requestParams: GetAllBudgetsParams = {
      limit: DEFAULT_BUDGETS_LIMIT,
      ...params,
    };

    this._loading.set(true);

    try {
      const response: GetAllBudgetsResponse = await firstValueFrom(this.budgetsApi.getAllBudgets(requestParams));

      if (isApiSuccessWithData(response, API_STATUS.OK)) {
        this._nextCursor.set(response.pagination.nextCursor);
        this._hasMore.set(response.pagination.hasMore);

        if (!params?.cursor) {
          // first page — same as response.page === 1
          this._budgets.set(response?.data);
          this.storeBudgets(this._budgets());
        } else {
          // next pages — merge into existing list
          this._budgets.set([...this._budgets(), ...response?.data]);
        }
      }
    } catch (error) {
      console.error(`[BudgetsStore] failed to get budgets: `, error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  public async getBudgetById(id: string) {
    try {
      const response: GetBudgetResponse = await firstValueFrom(this.budgetsApi.getBudgetById(id));

      if (isApiSuccessWithData(response, API_STATUS.OK)) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error(`[BudgetsStore] failed to get budget: `, error);
      throw error;
    }
  }

  public async getBudgetSummary() {
    try {
      const response: GetBudgetSummaryResponse = await firstValueFrom(this.budgetsApi.getBudgetSummary());

      if (!isApiSuccessWithData(response, API_STATUS.OK)) return null;

      this._budgetSummary.set(response.data);
      return response.data;
    } catch (error) {
      console.error(`[BudgetsStore] failed to get budget summary: `, error);
      throw error;
    }
  }

  public async createBudget(body: CreateBudgetRequest) {
    try {
      const response: CreateBudgetResponse = await firstValueFrom(this.budgetsApi.createBudget(body));

      if (!isApiSuccessWithData(response, API_STATUS.CREATED)) return false;

      this._budgets.update(budgets => [response.data, ...budgets]);
      return true;
    } catch (error) {
      console.error(`[BudgetsStore] failed to create budget: `, error);
      throw error;
    }
  }

  public async updateBudget(id: string, body: UpdateBudgetRequest) {
    try {
      const response: UpdateBudgetResponse = await firstValueFrom(this.budgetsApi.updateBudgetById(id, body));

      if (!isApiSuccessWithData(response, API_STATUS.OK)) return false;

      this._budgets.update(budgets => budgets.map(b => (b.id === id ? response.data : b)));
      return true;
    } catch (error) {
      console.error(`[BudgetsStore] failed to update budget: `, error);
      throw error;
    }
  }

  public async deleteBudget(id: string) {
    try {
      const response: DeleteBudgetResponse = await firstValueFrom(this.budgetsApi.deleteBudgetById(id));

      if (!isApiSuccess(response, API_STATUS.OK)) return false;

      this._budgets.update(budgets => budgets.filter(b => b.id !== id));
      return true;
    } catch (error) {
      console.error(`[BudgetsStore] failed to delete budget: `, error);
      throw error;
    }
  }

  public async initializeBudgetsFromStorage() {
    this.clearPagination();

    const budgets: Budget[] = this.getBudgetsFromStorage();

    if (budgets?.length > 0) {
      this.storeBudgets(budgets);
      void this.getAllBudgets();
    } else {
      await this.getAllBudgets();
    }
  }

  public clearBudgets() {
    localStorage.removeItem(BUDGETS_STORAGE_KEY);
    this._budgets.set([]);
    this._budgetSummary.set(null);
    this.clearPagination();
  }

  // Private helpers
  private storeBudgets(budgets: Budget[]) {
    this._budgets.set(budgets);
    localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
  }

  private getBudgetsFromStorage(): Budget[] {
    try {
      const rawStorage = localStorage.getItem(BUDGETS_STORAGE_KEY);
      if (!rawStorage) return [];

      const parsedStorage = JSON.parse(rawStorage);
      if (parsedStorage?.length > 0) return parsedStorage as Budget[];

      return [];
    } catch (error) {
      localStorage.removeItem(BUDGETS_STORAGE_KEY);
      return [];
    }
  }

  private clearPagination() {
    this._hasMore.set(false);
    this._nextCursor.set(null);
  }
}