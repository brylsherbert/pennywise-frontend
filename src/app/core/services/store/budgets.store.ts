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
const BUDGETS_SUMMARY_STORAGE_KEY = 'budgets-summary';
const DEFAULT_BUDGETS_LIMIT = 100;

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
  public readonly defaultBudgetsLimit = DEFAULT_BUDGETS_LIMIT;

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
          this.storeBudgets(response.data);
        } else {
          this._budgets.set([...this._budgets(), ...response.data]);
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

      this.storeBudgetSummary(response.data);
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

  public async initializeBudgetSummaryFromStorage() {
    const budgetSummary: BudgetSummary | null = this.getBudgetSummaryFromStorage();

    if (budgetSummary) {
      this.storeBudgetSummary(budgetSummary);
      void this.getBudgetSummary();
    } else {
      await this.getBudgetSummary();
    }
  }

  public clearBudgets() {
    localStorage.removeItem(BUDGETS_STORAGE_KEY);
    localStorage.removeItem(BUDGETS_SUMMARY_STORAGE_KEY);
    this._budgets.set([]);
    this._budgetSummary.set(null);
    this.clearPagination();
  }

  // Private helpers
  private storeBudgets(budgets: Budget[]) {
    this._budgets.set(budgets);
    localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
  }

  private storeBudgetSummary(budgetSummary: BudgetSummary | null) {
    this._budgetSummary.set(budgetSummary);
    localStorage.setItem(BUDGETS_SUMMARY_STORAGE_KEY, JSON.stringify(budgetSummary));
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

  private getBudgetSummaryFromStorage(): BudgetSummary | null {
    try {
      const rawStorage = localStorage.getItem(BUDGETS_SUMMARY_STORAGE_KEY);
      if (!rawStorage) return null;

      const parsedStorage = JSON.parse(rawStorage);
      if (parsedStorage && typeof parsedStorage === 'object') return parsedStorage as BudgetSummary;

      return null;
    } catch (error) {
      localStorage.removeItem(BUDGETS_SUMMARY_STORAGE_KEY);
      return null;
    }
  }

  private clearPagination() {
    this._hasMore.set(false);
    this._nextCursor.set(null);
  }
}