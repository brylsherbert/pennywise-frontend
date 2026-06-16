import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateBudgetRequest,
  CreateBudgetResponse,
  DeleteBudgetResponse,
  GetBudgetResponse,
  GetAllBudgetsResponse,
  UpdateBudgetRequest,
  UpdateBudgetResponse,
  GetBudgetSummaryResponse
} from '../../models/budgets.model';
import { CursorPaginationParams } from '../../models/pagination.model';

const BASE_URL = `${environment.apiUrl}/budgets`;
const CREATE_ENDPOINT = 'create';
const UPDATE_ENDPOINT = 'update';
const DELETE_ENDPOINT = 'delete';
const BUDGET_SUMMARY_ENDPOINT = 'summary';

@Injectable({ providedIn: 'root' })
export class BudgetsApi {
  private readonly http = inject(HttpClient);

  getAllBudgets(params?: CursorPaginationParams): Observable<GetAllBudgetsResponse> {
    let httpParams = new HttpParams;

    if (params?.cursor) httpParams = httpParams.set('cursor', params.cursor);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<GetAllBudgetsResponse>(`${BASE_URL}`, { params: httpParams });
  }

  getBudgetById(id: string): Observable<GetBudgetResponse> {
    return this.http.get<GetBudgetResponse>(`${BASE_URL}/${id}`);
  }

  getBudgetSummary(): Observable<GetBudgetSummaryResponse> {
    return this.http.get<GetBudgetSummaryResponse>(`${BASE_URL}/${BUDGET_SUMMARY_ENDPOINT}`);
  }

  createBudget(body: CreateBudgetRequest): Observable<CreateBudgetResponse> {
    return this.http.post<CreateBudgetResponse>(`${BASE_URL}/${CREATE_ENDPOINT}`, body);
  }

  updateBudgetById(id: string, body: UpdateBudgetRequest): Observable<UpdateBudgetResponse> {
    return this.http.patch<UpdateBudgetResponse>(`${BASE_URL}/${id}/${UPDATE_ENDPOINT}`, body);
  }

  deleteBudgetById(id: string): Observable<DeleteBudgetResponse> {
    return this.http.delete<DeleteBudgetResponse>(`${BASE_URL}/${id}/${DELETE_ENDPOINT}`);
  }
}