import { ApiSuccessResponse } from './api-response.model';
import { User } from './user.model';

// ─── Payloads ───────────────────────────────────────

export interface AuthData {
    user: User;
    token: string;
}

// ─── Requests ──────────────────────────────────────────────────────────────

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

// ─── Responses ───────────────────────────────────────────────────────────────

export type LoginResponse = ApiSuccessResponse<AuthData, 200>;
export type RegisterResponse = ApiSuccessResponse<AuthData, 201>;
export type LogoutResponse = ApiSuccessResponse<null, 200>;