export type ApiErrorResponse = {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
};

export const getErrorMessage = (error: unknown, fallback = "An unexpected error occurred"): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || fallback;
  if (error && typeof error === "object") {
    const apiError = error as ApiErrorResponse;
    return (
      apiError.response?.data?.message ??
      apiError.response?.data?.error ??
      apiError.message ??
      fallback
    );
  }
  return fallback;
};
