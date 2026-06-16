export interface Pagination {
    nextCursor: string;
    hasMore: boolean;
}

export interface CursorPaginationParams {
    cursor?: string;
    limit?: number;
}