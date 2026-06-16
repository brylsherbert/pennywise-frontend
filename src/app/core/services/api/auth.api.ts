import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
} from '../../models/auth.model';

const BASE_URL = `${environment.apiUrl}/auth`;
const REGISTER_ENDPOINT = 'create';
const LOGIN_ENDPOINT = 'login';
const LOGOUT_ENDPOINT = 'logout';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);

  register(body: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${BASE_URL}/${REGISTER_ENDPOINT}`, body);
  }

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${BASE_URL}/${LOGIN_ENDPOINT}`, body);
  }

  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(`${BASE_URL}/${LOGOUT_ENDPOINT}`, {});
  }
}
