import { WritableSignal } from '@angular/core';
import { form, min, required } from '@angular/forms/signals';
import { TransactionType } from '../../../core/models/transactions.model';

export interface TransactionFormData {
  account_id: string;
  budget_id: string;
  title: string;
  type: TransactionType;
  amount: number | null;
  transaction_date: string;
}

export function createTransactionSignalForm(model: WritableSignal<TransactionFormData>) {
  return form(model, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });
    required(schemaPath.amount, { message: 'Amount is required' });
    min(schemaPath.amount, 0.01, { message: 'Amount must be greater than 0' });
    required(schemaPath.transaction_date, { message: 'Date is required' });
  });
}

export type TransactionSignalForm = ReturnType<typeof createTransactionSignalForm>;

export function showAccountFieldForType(type: TransactionType): boolean {
  return type !== 'fill';
}

export function showBudgetFieldForType(type: TransactionType): boolean {
  return type !== 'income';
}

export function isAssociationInvalid(model: TransactionFormData): boolean {
  const { type, account_id, budget_id } = model;

  if (type === 'income') return !account_id;
  if (type === 'fill') return !budget_id;
  return !account_id || !budget_id;
}

export function isDateToday(date: string): boolean {
  if (!date) return false;

  const today = new Date();
  const value = new Date(date);

  return (
    value.getFullYear() === today.getFullYear() &&
    value.getMonth() === today.getMonth() &&
    value.getDate() === today.getDate()
  );
}

export function createDefaultTransactionFormData(): TransactionFormData {
  return {
    account_id: '',
    budget_id: '',
    title: '',
    type: 'expense',
    amount: null,
    transaction_date: new Date().toISOString(),
  };
}
