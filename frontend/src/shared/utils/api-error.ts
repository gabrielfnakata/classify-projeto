interface ApiErrorShape {
  response?: { data?: { message?: string } };
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  return (error as ApiErrorShape | null)?.response?.data?.message ?? fallback;
}
