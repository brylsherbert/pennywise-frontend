import { ApiPaginatedSuccessResponse, ApiSuccessResponse } from './api-response.model';
import { CursorPaginationParams } from './pagination.model';

// ─── Domain ────────────────────────────────────────────────────────────────

export interface Budget {
    id: string;
    user_id: string;
    category_id: null;
    name: string;
    target_amount: string;
    allocated_amount: string;
    created_at: string;
    updated_at: string;
}

export interface BudgetSummary {
    total_balance: string;
    total_allocated: string;
    total_income_amount: string;
    total_expense_amount: string;
    total_fill_amount: string;
    total_unallocated: string;
}

// ─── Requests ──────────────────────────────────────────────────────────────

interface BudgetRequest {
    name: string;
    target_amount: number;
}

export type CreateBudgetRequest = BudgetRequest;
export type UpdateBudgetRequest = Partial<BudgetRequest>;

export type GetAllBudgetsParams = CursorPaginationParams;

// ─── Responses ───────────────────────────────────────────────────────────────

export type GetAllBudgetsResponse = ApiPaginatedSuccessResponse<Budget[], 200>;
export type GetBudgetResponse = ApiSuccessResponse<Budget, 200>;
export type GetBudgetSummaryResponse = ApiSuccessResponse<BudgetSummary, 200>;
export type CreateBudgetResponse = ApiSuccessResponse<Budget, 201>;
export type UpdateBudgetResponse = ApiSuccessResponse<Budget, 200>;
export type DeleteBudgetResponse = ApiSuccessResponse<null, 200>;