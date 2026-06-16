import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateCategoryRequest,
  CreateCategoryResponse,
  DeleteCategoryResponse,
  GetCategoryResponse,
  GetAllCategoriesResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
} from '../../models/categories.model';

const BASE_URL = `${environment.apiUrl}/categories`;
const CREATE_ENDPOINT = 'create';
const UPDATE_ENDPOINT = 'update';
const DELETE_ENDPOINT = 'delete';

@Injectable({ providedIn: 'root' })
export class CategoriesApi {
  private readonly http = inject(HttpClient);

  getAllCategories(): Observable<GetAllCategoriesResponse> {
    return this.http.get<GetAllCategoriesResponse>(`${BASE_URL}`);
  }

  getCategoryById(id: string): Observable<GetCategoryResponse> {
    return this.http.get<GetCategoryResponse>(`${BASE_URL}/${id}`);
  }

  createCategory(body: CreateCategoryRequest): Observable<CreateCategoryResponse> {
    return this.http.post<CreateCategoryResponse>(`${BASE_URL}/${CREATE_ENDPOINT}`, body);
  }

  updateCategoryById(id: string, body: UpdateCategoryRequest): Observable<UpdateCategoryResponse> {
    return this.http.patch<UpdateCategoryResponse>(`${BASE_URL}/${id}/${UPDATE_ENDPOINT}`, body);
  }

  deleteCategoryById(id: string): Observable<DeleteCategoryResponse> {
    return this.http.delete<DeleteCategoryResponse>(`${BASE_URL}/${id}/${DELETE_ENDPOINT}`);
  }
}