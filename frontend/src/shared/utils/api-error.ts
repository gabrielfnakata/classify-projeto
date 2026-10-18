interface ApiErrorShape {
  response?: { data?: { mensagem?: string } };
}

// Extrai a mensagem amigável que o backend devolve no ExceptionDTO (campo `mensagem`).
export function apiErrorMessage(error: unknown, fallback: string): string {
  return (error as ApiErrorShape | null)?.response?.data?.mensagem ?? fallback;
}
