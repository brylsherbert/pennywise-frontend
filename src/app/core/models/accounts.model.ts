import { ApiPaginatedSuccessResponse, ApiSuccessResponse } from './api-response.model';
import { CursorPaginationParams } from './pagination.model';

// ─── Domain ────────────────────────────────────────────────────────────────

export interface Account {
    id: string;
    user_id: string;
    name: string;
    balance: string;
    created_at: string;
    updated_at: string;
}

// ─── Requests ──────────────────────────────────────────────────────────────

interface AccountRequest {
    name: string;
    balance: string;
}

export type CreateAccountRequest = AccountRequest;
export type UpdateAccountRequest = Partial<AccountRequest>;

export type GetAllAccountsParams = CursorPaginationParams;
// ─── Responses ───────────────────────────────────────────────────────────────

export type GetAllAccountsResponse = ApiPaginatedSuccessResponse<Account[], 200>;
export type GetAccountResponse = ApiSuccessResponse<Account, 200>;
export type CreateAccountResponse = ApiSuccessResponse<Account, 201>;
export type UpdateAccountResponse = ApiSuccessResponse<Account, 200>;
export type DeleteAccountResponse = ApiSuccessResponse<null, 200>;