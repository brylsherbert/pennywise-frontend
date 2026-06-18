import { AccountsStore } from '../../../core/services/store/accounts.store';
import { BudgetsStore } from '../../../core/services/store/budgets.store';
import { TransactionType } from '../../../core/models/transactions.model';

export function refreshStoresForTransactionType(
  type: TransactionType,
  accountsStore: AccountsStore,
  budgetsStore: BudgetsStore,
): void {
  switch (type) {
    case 'income':
      void accountsStore.getAllAccounts();
      void budgetsStore.getBudgetSummary();
      break;
    case 'fill':
      void budgetsStore.getAllBudgets();
      void budgetsStore.getBudgetSummary();
      break;
    case 'expense':
    default:
      void accountsStore.getAllAccounts();
      void budgetsStore.getAllBudgets();
      void budgetsStore.getBudgetSummary();
      break;
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object' || !('error' in error)) return fallback;

  return (error as { error?: { error?: string } }).error?.error ?? fallback;
}
