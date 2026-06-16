import { ApiSuccessResponse } from './api-response.model';
import { AuthData } from './auth.model';

// ─── Domain ────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    email: string;
    username: string;
    created_at?: string;
    updated_at?: string;
}

// ─── Requests ──────────────────────────────────────────────────────────────

export interface UpdateUserRequest {
    username: string;
    password: string;
    confirmPassword: string;
}

// ─── Responses ───────────────────────────────────────────────────────────────

export type GetUserResponse = ApiSuccessResponse<User, 200>;
export type UpdateUserResponse = ApiSuccessResponse<AuthData, 200>;
export type DeleteUserResponse = ApiSuccessResponse<null, 200>;