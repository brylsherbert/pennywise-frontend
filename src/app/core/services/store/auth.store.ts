import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthApi } from '../api/auth.api';
import { AuthData, LoginRequest, LoginResponse, LogoutResponse, RegisterRequest, RegisterResponse } from '../../models/auth.model';
import { firstValueFrom, Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { API_STATUS, isApiSuccess, isApiSuccessWithData } from '../../models/api-response.model';

type AuthAction = 'login' | 'register';
const AUTH_DATA_STORAGE_KEY = 'authData';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly authApi = inject(AuthApi);

  private _authData = signal<AuthData | null>(null);

  public authData = this._authData.asReadonly();
  public user = computed(() => this.authData()?.user);
  public userToken = computed(() => this.authData()?.token);
  public isAuthenticated = computed(() => !!this.userToken());

  // Public actions (login, register, logout, initialize)
  public async login(body: LoginRequest) {
    return this.authenticate(this.authApi.login(body), 'login');
  }

  public async register(body: RegisterRequest) {
    return await this.authenticate(this.authApi.register(body), 'register');
  }

  public async logout() {
    try {
      const response: LogoutResponse = await firstValueFrom(this.authApi.logout());

      if (!isApiSuccess(response, API_STATUS.OK)) return false;

      return true;
    } catch (error) {
      console.error('[AuthStore] logout failed: ', error);
      throw error;
    }
  }

  public initializeAuthDataFromStorage() {
    const authData: AuthData | null = this.getAuthDataFromStorage();

    if (authData !== null) {
      this.storeAuthData(authData);
    }
  }

  public setSession(authData: AuthData): void {
    this.storeAuthData(authData);
  }

  public clearSession(): void {
    this.clearAuthData();
  }

  public updateUser(user: User): void {
    const currentAuthData = this._authData();
    if (!currentAuthData) return;

    this.storeAuthData({ ...currentAuthData, user });
  }

  // Private helpers (authenticate, persist, clear, read from storage)
  private async authenticate(
    request$: Observable<LoginResponse | RegisterResponse>,
    action: AuthAction
  ): Promise<boolean> {
    const apiStatus = action === 'login' ? API_STATUS.OK : API_STATUS.CREATED;
    try {
      const response = await firstValueFrom(request$);
      if (!isApiSuccessWithData(response, apiStatus)) return false;
      this.storeAuthData(response.data);
      return true;
    } catch (error) {
      console.error(`[AuthStore] ${action} failed: `, error);
      throw error;
    }
  }

  private storeAuthData(authData: AuthData | null) {
    this._authData.set(authData);
    localStorage.setItem(AUTH_DATA_STORAGE_KEY, JSON.stringify(authData));
  }

  private getAuthDataFromStorage(): AuthData | null {
    try {
      const rawStorage = localStorage.getItem(AUTH_DATA_STORAGE_KEY);
      if (!rawStorage) return null;

      const parsedStorage = JSON.parse(rawStorage);
      if (parsedStorage?.token && parsedStorage?.user?.id) return parsedStorage as AuthData;

      return null;
    } catch (error) {
      localStorage.removeItem(AUTH_DATA_STORAGE_KEY);
      return null;
    }
  }

  private clearAuthData() {
    localStorage.removeItem(AUTH_DATA_STORAGE_KEY);
    this._authData.set(null);
  }
}
