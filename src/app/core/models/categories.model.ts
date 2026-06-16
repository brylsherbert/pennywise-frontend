import { ApiPaginatedSuccessResponse, ApiSuccessResponse } from './api-response.model';

// ─── Domain ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

// ─── Requests ──────────────────────────────────────────────────────────────

interface CategoryRequest {
    name: string;
    color: string;
}


export type CreateCategoryRequest = CategoryRequest;
export type UpdateCategoryRequest = Partial<CategoryRequest>;

// ─── Responses ───────────────────────────────────────────────────────────────

export type GetAllCategoriesResponse = ApiSuccessResponse<Category[], 200>;
export type GetCategoryResponse = ApiSuccessResponse<Category, 200>;
export type CreateCategoryResponse = ApiSuccessResponse<Category, 201>;
export type UpdateCategoryResponse = ApiSuccessResponse<Category, 200>;
export type DeleteCategoryResponse = ApiSuccessResponse<null, 200>;