import { ApiPaginatedSuccessResponse, ApiSuccessResponse } from './api-response.model';
import { CursorPaginationParams } from './pagination.model';

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

// ─── Requests ──────────────────────────────────────────────────────────────

interface TransactionRequest {
    account_id?: string;
    budget_id?: string;
    title: string;
    type: TransactionType;
    amount: number;
    transaction_data: string
}


export type CreateTransactionRequest = TransactionRequest;
export type UpdateTransactionRequest = Partial<TransactionRequest>;

export type GetAllTransactionsParams = CursorPaginationParams;

// ─── Responses ───────────────────────────────────────────────────────────────

export type GetAllTransactionsResponse = ApiPaginatedSuccessResponse<Transaction[], 200>;
export type GetAllTransactionsByBudgetIdResponse = ApiSuccessResponse<Transaction[], 200>;
export type GetAllTransactionsByAccountIdResponse = ApiSuccessResponse<Transaction[], 200>;
export type GetTransactionResponse = ApiSuccessResponse<Transaction, 200>;
export type CreateTransactionResponse = ApiSuccessResponse<Transaction, 201>;
export type UpdateTransactionResponse = ApiSuccessResponse<Transaction, 200>;
export type DeleteTransactionResponse = ApiSuccessResponse<null, 200>;