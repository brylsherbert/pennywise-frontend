import { Pagination } from './pagination.model';

export const API_STATUS = {
  OK: 200,
  CREATED: 201,
} as const;

export type ApiStatus = (typeof API_STATUS)[keyof typeof API_STATUS];

export interface ApiSuccessResponse<TData, TStatus extends number = number> {
    status: TStatus;
    message: string;
    data: TData;
}

export interface ApiPaginatedSuccessResponse<TData, TStatus extends number = number>
  extends ApiSuccessResponse<TData, TStatus> {
  pagination: Pagination;
}

export function isApiSuccess<TData, TStatus extends number = number>(
  response: ApiSuccessResponse<TData, TStatus> | null | undefined,
  expectedStatus: TStatus = API_STATUS.OK as TStatus
): response is ApiSuccessResponse<TData, TStatus> {
  return response?.status === expectedStatus;
}

export function isApiSuccessWithData<TData, TStatus extends number = number>(
  response: ApiSuccessResponse<TData, TStatus> | null | undefined,
  expectedStatus: TStatus = API_STATUS.OK as TStatus
): response is ApiSuccessResponse<NonNullable<TData>, TStatus> {
  return isApiSuccess(response, expectedStatus) && response.data != null;
}