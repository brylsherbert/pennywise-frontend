import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserApi } from '../api/user.api';
import { DeleteUserResponse, GetUserResponse, ResetAllDataResponse, UpdateUserRequest, UpdateUserResponse } from '../../models/user.model';
import { API_STATUS, isApiSuccess, isApiSuccessWithData } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  private readonly userApi = inject(UserApi);

  // Public actions
  public async getUser() {
    try {
      const response: GetUserResponse = await firstValueFrom(this.userApi.getUser());

      if (!isApiSuccessWithData(response, API_STATUS.OK)) return null;
        
      return response?.data;
    } catch (error) {
      console.error(`[UserStore] failed to get user: `, error);
      throw error;
    }
  }

  public async updateUser(body: UpdateUserRequest) {
    try {
      const response: UpdateUserResponse = await firstValueFrom(this.userApi.updateUser(body));

      if (!isApiSuccessWithData(response, API_STATUS.OK)) return null;

      return response.data;
    } catch (error) {
      console.error(`[UserStore] failed to update user: `, error);
      throw error;
    }
  }

  public async deleteUser() {
    try {
      const response: DeleteUserResponse = await firstValueFrom(this.userApi.deletedUser());

      if (!isApiSuccess(response, API_STATUS.OK)) return false;

      return true;
    } catch (error) {
      console.error('[UserStore] failed to delete user: ', error);
      throw error;
    }
  }

  public async resetAllData() {
    try {
      const response: ResetAllDataResponse = await firstValueFrom(this.userApi.resetAllData());

      if (!isApiSuccess(response, API_STATUS.OK)) return false;

      return true;
    } catch (error) {
      console.error('[UserStore] failed to delete user: ', error);
      throw error;
    }
  }
}
