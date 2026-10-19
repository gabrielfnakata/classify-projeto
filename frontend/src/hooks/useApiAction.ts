import { useCallback, useState } from "react";
import { apiErrorMessage } from "@/shared/utils/api-error";

// Centraliza o padrão "chama a API, guarda a mensagem de erro amigável e avisa quem
// precisa recarregar". Evita repetir try/catch + estado de erro em cada tela.
export default function useApiAction(onSuccess?: () => void) {
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const run = useCallback(async (action: () => Promise<unknown>, fallbackMessage: string): Promise<boolean> => {
        setError(null);
        setPending(true);

        try {
            await action();
            onSuccess?.();
            return true;
        } catch (err: unknown) {
            setError(apiErrorMessage(err, fallbackMessage));
            return false;
        } finally {
            setPending(false);
        }
    }, [onSuccess]);

    const clearError = useCallback(() => setError(null), []);

    return { error, pending, run, clearError };
}
