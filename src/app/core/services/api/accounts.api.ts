import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateAccountRequest,
  CreateAccountResponse,
  DeleteAccountResponse,
  GetAccountResponse,
  GetAllAccountsResponse,
  UpdateAccountRequest,
  UpdateAccountResponse
} from '../../models/accounts.model';
import { CursorPaginationParams } from '../../models/pagination.model';

const BASE_URL = `${environment.apiUrl}/accounts`;
const CREATE_ENDPOINT = 'create';
const UPDATE_ENDPOINT = 'update';
const DELETE_ENDPOINT = 'delete';

@Injectable({ providedIn: 'root' })
export class AccountsApi {
  private readonly http = inject(HttpClient);

  getAllAccounts(params?: CursorPaginationParams): Observable<GetAllAccountsResponse> {
    let httpParams = new HttpParams;

    if (params?.cursor) httpParams = httpParams.set('cursor', params.cursor);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<GetAllAccountsResponse>(`${BASE_URL}`, { params: httpParams });
  }

  getAccountById(id: string): Observable<GetAccountResponse> {
    return this.http.get<GetAccountResponse>(`${BASE_URL}/${id}`);
  }

  createAccount(body: CreateAccountRequest): Observable<CreateAccountResponse> {
    return this.http.post<CreateAccountResponse>(`${BASE_URL}/${CREATE_ENDPOINT}`, body);
  }

  updateAccountById(id: string, body: UpdateAccountRequest): Observable<UpdateAccountResponse> {
    return this.http.patch<UpdateAccountResponse>(`${BASE_URL}/${id}/${UPDATE_ENDPOINT}`, body);
  }

  deleteAccountById(id: string): Observable<DeleteAccountResponse> {
    return this.http.delete<DeleteAccountResponse>(`${BASE_URL}/${id}/${DELETE_ENDPOINT}`);
  }
}