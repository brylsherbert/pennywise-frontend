import { WritableSignal } from '@angular/core';
import { form, min, required } from '@angular/forms/signals';

export interface BudgetFormData {
  name: string;
  target_amount: number | null;
  category_id: string;
}

export function createBudgetSignalForm(model: WritableSignal<BudgetFormData>) {
  return form(model, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required' });
    required(schemaPath.target_amount, { message: 'Target amount is required' });
    min(schemaPath.target_amount, 0.01, { message: 'Target amount must be greater than 0' });
  });
}

export type BudgetSignalForm = ReturnType<typeof createBudgetSignalForm>;

export function createDefaultBudgetFormData(): BudgetFormData {
  return {
    name: '',
    target_amount: null,
    category_id: '',
  };
}

export function toBudgetFormData(budget: { name: string; target_amount: string; category_id: string | null }): BudgetFormData {
  return {
    name: budget.name,
    target_amount: Number(budget.target_amount),
    category_id: budget.category_id ?? '',
  };
}
