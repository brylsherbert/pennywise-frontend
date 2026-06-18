import { WritableSignal } from '@angular/core';
import { form, minLength, required } from '@angular/forms/signals';
import { User } from '../../../core/models/user.model';

export interface UserFormData {
  username: string;
  password: string;
  confirmPassword: string;
}

export function createUserSignalForm(model: WritableSignal<UserFormData>) {
  return form(model, (schemaPath) => {
    required(schemaPath.username, { message: 'Username is required' });
    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 8, {
      message: 'Password must be at least 8 characters',
    });
    required(schemaPath.confirmPassword, { message: 'Confirm password is required' });
  });
}

export type UserSignalForm = ReturnType<typeof createUserSignalForm>;

export function toUserFormData(user: User): UserFormData {
  return {
    username: user.username,
    password: '',
    confirmPassword: '',
  };
}
