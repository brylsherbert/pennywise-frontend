import { Transaction, TransactionDateGroup } from '../../../core/models/transactions.model';

export type TransactionFilterType = 'all' | 'income' | 'expense' | 'fill' | string;
export type TransactionSortType = 'default' | 'date-asc' | 'date-desc';

export interface TransactionsView {
  groups: TransactionDateGroup[];
  filteredCount: number;
}

export function buildTransactionsView(
  transactions: Transaction[],
  searchQuery: string,
  filter: TransactionFilterType,
  sort: TransactionSortType,
): TransactionsView {
  const filtered: Transaction[] = [];

  for (const transaction of transactions) {
    if (searchQuery && !transaction.title.toLowerCase().includes(searchQuery)) {
      continue;
    }

    if (!matchesFilter(transaction, filter)) {
      continue;
    }

    filtered.push(transaction);
  }

  const sorted = sortTransactions(filtered, sort);
  const groups = groupTransactionsByDate(sorted);

  return {
    groups: sortDateGroups(groups, sort),
    filteredCount: filtered.length,
  };
}

export function getTransactionFilterLabel(activeFilter: TransactionFilterType): string {
  switch (activeFilter) {
    case 'all':
      return 'Filter';
    case 'income':
      return 'Income';
    case 'expense':
      return 'Expense';
    case 'fill':
      return 'Fill';
    default:
      return activeFilter;
  }
}

export function getTransactionSortLabel(activeSort: TransactionSortType): string {
  switch (activeSort) {
    case 'date-asc':
      return 'Oldest first';
    case 'date-desc':
      return 'Newest first';
    default:
      return 'Sort';
  }
}

function matchesFilter(transaction: Transaction, filter: TransactionFilterType): boolean {
  switch (filter) {
    case 'income':
      return transaction.type === 'income';
    case 'expense':
      return transaction.type === 'expense';
    case 'fill':
      return transaction.type === 'fill';
    default:
      return true;
  }
}

function sortTransactions(transactions: Transaction[], sort: TransactionSortType): Transaction[] {
  if (sort !== 'date-asc' && sort !== 'date-desc') {
    return transactions;
  }

  const sorted = [...transactions];

  sorted.sort((a, b) => {
    const aTime = new Date(a.transaction_date).getTime();
    const bTime = new Date(b.transaction_date).getTime();
    return sort === 'date-asc' ? aTime - bTime : bTime - aTime;
  });

  return sorted;
}

function groupTransactionsByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    const date = transaction.transaction_date?.slice(0, 10) ?? '';
    const group = groups.get(date);

    if (group) {
      group.push(transaction);
    } else {
      groups.set(date, [transaction]);
    }
  }

  return groups;
}

function sortDateGroups(
  groups: Map<string, Transaction[]>,
  sort: TransactionSortType,
): TransactionDateGroup[] {
  const result: TransactionDateGroup[] = [];

  for (const [transaction_date, groupTransactions] of groups) {
    result.push({ transaction_date, transactions: groupTransactions });
  }

  result.sort((a, b) =>
    sort === 'date-asc'
      ? a.transaction_date.localeCompare(b.transaction_date)
      : b.transaction_date.localeCompare(a.transaction_date),
  );

  return result;
}
