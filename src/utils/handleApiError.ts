interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
    };
}

export function handleApiError(error: unknown, code: string): ApiErrorResponse {
    if (error instanceof Error) {
        return {
            success: false,
            error: { code, message: error.message },
        };
    }
    return {
        success: false,
        error: { code, message: String(error) },
    };
}