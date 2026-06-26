import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateTransactionRequest,
  CreateTransactionResponse,
  DeleteTransactionResponse,
  GetTransactionResponse,
  GetAllTransactionsResponse,
  UpdateTransactionRequest,
  UpdateTransactionResponse,
  GetAllTransactionsByBudgetIdResponse,
  GetAllTransactionsByAccountIdResponse,
  GetAllTransactionBudgetsByTransactionIdResponse,
  GetAllTransactionBudgetsResponse,
} from '../../models/transactions.model';
import { CursorPaginationParams } from '../../models/pagination.model';

const BASE_URL = `${environment.apiUrl}/transactions`;
const TRANSACTION_BUDGET_ENDPOINT = `fill-budgets`;
const TRANSACTION_BUDGET_DELETE_ENDPOINT = `fill-budget/delete`;
const CREATE_ENDPOINT = 'create';
const UPDATE_ENDPOINT = 'update';
const DELETE_ENDPOINT = 'delete';
const BUDGETS_ENDPOINT = 'budgets';
const ACCOUNTS_ENDPOINT = 'accounts';

@Injectable({ providedIn: 'root' })
export class TransactionsApi {
  private readonly http = inject(HttpClient);

  getAllTransactions(params?: CursorPaginationParams): Observable<GetAllTransactionsResponse> {
    let httpParams = new HttpParams;

    if (params?.cursor) httpParams = httpParams.set('cursor', params.cursor);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<GetAllTransactionsResponse>(`${BASE_URL}`, { params: httpParams });
  }

  getAllTransactionsByBudgetId(id: string): Observable<GetAllTransactionsByBudgetIdResponse> {
    return this.http.get<GetAllTransactionsByBudgetIdResponse>(`${BASE_URL}/${id}/${BUDGETS_ENDPOINT}`);
  }

  getAllTransactionsByAccountId(id: string): Observable<GetAllTransactionsByAccountIdResponse> {
    return this.http.get<GetAllTransactionsByAccountIdResponse>(`${BASE_URL}/${id}/${ACCOUNTS_ENDPOINT}`);
  }

  getAllTransactionBudgets(): Observable<GetAllTransactionBudgetsResponse> {
    return this.http.get<GetAllTransactionBudgetsResponse>(`${BASE_URL}/${TRANSACTION_BUDGET_ENDPOINT}`);
  }

  getAllTransactionBudgetsByTransactionId(id: string): Observable<GetAllTransactionBudgetsByTransactionIdResponse> {
    return this.http.get<GetAllTransactionBudgetsByTransactionIdResponse>(`${BASE_URL}/${id}/${TRANSACTION_BUDGET_ENDPOINT}`);
  }

  getTransactionById(id: string): Observable<GetTransactionResponse> {
    return this.http.get<GetTransactionResponse>(`${BASE_URL}/${id}`);
  }

  createTransaction(body: CreateTransactionRequest): Observable<CreateTransactionResponse> {
    return this.http.post<CreateTransactionResponse>(`${BASE_URL}/${CREATE_ENDPOINT}`, body);
  }

  updateTransactionById(id: string, body: UpdateTransactionRequest): Observable<UpdateTransactionResponse> {
    return this.http.patch<UpdateTransactionResponse>(`${BASE_URL}/${id}/${UPDATE_ENDPOINT}`, body);
  }

  deleteTransactionById(id: string): Observable<DeleteTransactionResponse> {
    return this.http.delete<DeleteTransactionResponse>(`${BASE_URL}/${id}/${DELETE_ENDPOINT}`);
  }

  deleteTransactionBudgetById(id: string): Observable<DeleteTransactionResponse> {
    return this.http.delete<DeleteTransactionResponse>(`${BASE_URL}/${id}/${TRANSACTION_BUDGET_DELETE_ENDPOINT}`);
  }
}