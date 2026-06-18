import { WritableSignal } from '@angular/core';
import { form, min, required } from '@angular/forms/signals';

export interface AccountFormData {
  name: string;
  balance: number | null;
}

export function createAccountSignalForm(model: WritableSignal<AccountFormData>) {
  return form(model, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required' });
    required(schemaPath.balance, { message: 'Balance is required' });
    min(schemaPath.balance, 0, { message: 'Balance cannot be negative' });
  });
}

export type AccountSignalForm = ReturnType<typeof createAccountSignalForm>;

export function createDefaultAccountFormData(): AccountFormData {
  return {
    name: '',
    balance: null,
  };
}

export function toAccountFormData(account: { name: string; balance: string }): AccountFormData {
  return {
    name: account.name,
    balance: Number(account.balance),
  };
}
