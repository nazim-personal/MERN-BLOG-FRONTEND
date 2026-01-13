export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data: T;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface ApiErrorResponse {
    success: false;
    message: string;
}
