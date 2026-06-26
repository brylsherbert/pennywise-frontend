import { WritableSignal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { TransactionType } from '../../../core/models/transactions.model';
export interface TransactionFormData {
  account_id: string;
  budget_id: string;
  budgets: TransactionBudgetPayload[];
  title: string;
  type: TransactionType;
  amount: number | null;
  transaction_date: string;
}

export interface TransactionBudgetPayload {
  budget_id: string;
  new_allocated_amount: number;
}

export function createTransactionSignalForm(model: WritableSignal<TransactionFormData>) {
  return form(model, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });
    required(schemaPath.transaction_date, { message: 'Date is required' });
  });
}

export type TransactionSignalForm = ReturnType<typeof createTransactionSignalForm>;

export function showAccountFieldForType(type: TransactionType): boolean {
  return ['expense', 'income'].includes(type);
}

export function showBudgetFieldForType(type: TransactionType): boolean {
  return ['expense'].includes(type);
}

export function showAmountFieldForType(type: TransactionType): boolean {
  return ['expense', 'income'].includes(type);
}

export function showBudgetsFieldForType(type: TransactionType): boolean {
  return ['fill'].includes(type);
}

export function showTotalUnallocatedAmountFieldForType(type: TransactionType): boolean {
  return ['fill'].includes(type);
}

export function isAssociationInvalid(model: TransactionFormData): boolean {
  const { type, account_id, budget_id, budgets, amount } = model;

  if (type === 'income') return !account_id || !amount;
  if (type === 'fill') return budgets?.length <= 0;
  return !account_id || !budget_id || !amount;
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
    budgets: [],
    type: 'expense',
    amount: null,
    transaction_date: new Date().toISOString(),
  };
}
