import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DeleteUserResponse, GetUserResponse, UpdateUserRequest, UpdateUserResponse } from '../../models/user.model';

const BASE_URL = `${environment.apiUrl}/user`;
const UPDATE_USER_ENDPOINT = 'update';
const DELETE_USER_ENDPOINT = 'delete';

@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly http = inject(HttpClient);

  getUser(): Observable<GetUserResponse> {
    return this.http.get<GetUserResponse>(`${BASE_URL}`);
  }

  updateUser(body: UpdateUserRequest): Observable<UpdateUserResponse> {
    return this.http.patch<UpdateUserResponse>(`${BASE_URL}/${UPDATE_USER_ENDPOINT}`, body);
  }

  deletedUser(): Observable<DeleteUserResponse> {
    return this.http.delete<DeleteUserResponse>(`${BASE_URL}/${DELETE_USER_ENDPOINT}`);
  }
}
