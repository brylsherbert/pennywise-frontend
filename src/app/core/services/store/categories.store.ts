import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CategoriesApi } from '../api/categories.api';
import {
  Category,
  GetCategoryResponse,
  GetAllCategoriesResponse,
  CreateCategoryRequest,
  CreateCategoryResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
} from '../../models/categories.model';
import { API_STATUS, isApiSuccess, isApiSuccessWithData } from '../../models/api-response.model';

const CATEGORIES_STORAGE_KEY = 'categories';

@Injectable({
  providedIn: 'root',
})
export class CategoriesStore {
  private readonly categoriesApi = inject(CategoriesApi);

  private _categories = signal<Category[]>([]);
  private _loading = signal(false);

  public readonly categories = this._categories.asReadonly();
  public readonly loading = this._loading.asReadonly();

  // Public actions
  public async getAllCategories() {
    this._loading.set(true);
    try {
      const response: GetAllCategoriesResponse = await firstValueFrom(this.categoriesApi.getAllCategories());

      if (isApiSuccessWithData(response, API_STATUS.OK)) {
        this.storeCategories(response.data);
      }

      return this._categories();
    } catch (error) {
      console.error(`[CategoriesStore] failed to get categories: `, error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  public async getCategoryById(id: string) {
    try {
      const response: GetCategoryResponse = await firstValueFrom(this.categoriesApi.getCategoryById(id));

      if (isApiSuccessWithData(response, API_STATUS.OK)) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error(`[CategoriesStore] failed to get category: `, error);
      throw error;
    }
  }

  public async createCategory(body: CreateCategoryRequest): Promise<Category | null> {
    try {
      const response: CreateCategoryResponse = await firstValueFrom(this.categoriesApi.createCategory(body));

      if (!isApiSuccessWithData(response, API_STATUS.CREATED)) return null;

      this._categories.update(categories => [response.data, ...categories]);
      return response.data;
    } catch (error) {
      console.error(`[CategoriesStore] failed to create category: `, error);
      throw error;
    }
  }

  public async updateCategory(id: string, body: UpdateCategoryRequest) {
    try {
      const response: UpdateCategoryResponse = await firstValueFrom(this.categoriesApi.updateCategoryById(id, body));

      if (!isApiSuccessWithData(response, API_STATUS.OK)) return false;

      this._categories.update(categories => categories.map(c => (c.id === id ? response.data : c)));
      return true;
    } catch (error) {
      console.error(`[CategoriesStore] failed to update category: `, error);
      throw error;
    }
  }

  public async deleteCategory(id: string) {
    try {
      const response: DeleteCategoryResponse = await firstValueFrom(this.categoriesApi.deleteCategoryById(id));

      if (!isApiSuccess(response, API_STATUS.OK)) return false;

      this._categories.update(categories => categories.filter(c => c.id !== id));
      return true;
    } catch (error) {
      console.error(`[CategoriesStore] failed to delete category: `, error);
      throw error;
    }
  }

  public async initializeCategoriesFromStorage() {
    const categories: Category[] = this.getCategoriesFromStorage();

    if (categories?.length > 0) {
      this.storeCategories(categories);
      void this.getAllCategories();
    } else {
      await this.getAllCategories();
    }
  }

  public clearCategories() {
    localStorage.removeItem(CATEGORIES_STORAGE_KEY);
    this._categories.set([]);
  }

  // Private helpers
  private storeCategories(categories: Category[]) {
    this._categories.set(categories);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }

  private getCategoriesFromStorage(): Category[] {
    try {
      const rawStorage = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (!rawStorage) return [];

      const parsedStorage = JSON.parse(rawStorage);
      if (parsedStorage?.length > 0) return parsedStorage as Category[];

      return [];
    } catch (error) {
      localStorage.removeItem(CATEGORIES_STORAGE_KEY);
      return [];
    }
  }
}