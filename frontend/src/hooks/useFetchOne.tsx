import { useCallback, useEffect, useState } from "react";
import api from "@/services/api";

// Irmão do useFetch para um único recurso (`/entidade/{uuid}`), com refetch.
export default function useFetchOne<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [version, setVersion] = useState(0);

    // Se a URL muda com o componente montado, o estado é ajustado ainda na renderização
    // (padrão recomendado pelo React) em vez de dentro do effect.
    const [requestedUrl, setRequestedUrl] = useState(url);
    if (url !== requestedUrl) {
        setRequestedUrl(url);
        setData(null);
        setError(null);
        setLoading(true);
    }

    useEffect(() => {
        let active = true;

        api.get<T>(url, { data: {} })
            .then((response) => {
                if (active) setData(response.status === 204 ? null : response.data);
            })
            .catch((err: Error) => {
                if (active) setError(err);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        // Ignora a resposta se a URL mudou (ou o componente saiu) antes dela chegar.
        return () => { active = false; };
    }, [url, version]);

    const refetch = useCallback(() => {
        setLoading(true);
        setVersion((v) => v + 1);
    }, []);

    return { data, loading, error, refetch };
}
