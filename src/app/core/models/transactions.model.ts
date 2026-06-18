import { ApiPaginatedSuccessResponse, ApiSuccessResponse } from './api-response.model';
import { CursorPaginationParams } from './pagination.model';
import { Account } from './accounts.model';
import { Budget } from './budgets.model';

export type TransactionType = 'income' | 'expense' | 'fill';

// ─── Domain ────────────────────────────────────────────────────────────────

export interface Transaction {
    id: string;
    user_id: string;
    account_id: null;
    budget_id: string;
    type: string;
    amount: string;
    title: string;
    transaction_date: string;
    created_at: string;
    updated_at: string;
}

export interface TransactionDateGroup {
    transaction_date: string;
    transactions: Transaction[];
}

// ─── Requests ──────────────────────────────────────────────────────────────

interface TransactionRequest {
    account_id?: string;
    budget_id?: string;
    title: string;
    type: TransactionType;
    amount: number;
    transaction_date: string
}


export type CreateTransactionRequest = TransactionRequest;
export type UpdateTransactionRequest = Partial<TransactionRequest>;

export type GetAllTransactionsParams = CursorPaginationParams;

// ─── Responses ───────────────────────────────────────────────────────────────

interface CreateTransactionResponseData {
    transaction: Transaction,
    account?: Account,
    budget?: Budget
}

interface UpdateTransactionResponseData {
    transaction: Transaction,
    updated_accounts?: {
        old_account?: Account,
        new_account?: Account
    },
    updated_budgets?: {
        old_budget?: Budget,
        new_budget?: Budget
    }
}

export type GetAllTransactionsResponse = ApiPaginatedSuccessResponse<Transaction[], 200>;
export type GetAllTransactionsByBudgetIdResponse = ApiSuccessResponse<Transaction[], 200>;
export type GetAllTransactionsByAccountIdResponse = ApiSuccessResponse<Transaction[], 200>;
export type GetTransactionResponse = ApiSuccessResponse<Transaction, 200>;
export type CreateTransactionResponse = ApiSuccessResponse<CreateTransactionResponseData, 201>;
export type UpdateTransactionResponse = ApiSuccessResponse<UpdateTransactionResponseData, 200>;
export type DeleteTransactionResponse = ApiSuccessResponse<null, 200>;