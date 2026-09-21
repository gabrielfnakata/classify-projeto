import { useCallback, useEffect, useState } from "react";
import api from "@/services/api";

/**
 * Lista de recursos da API com duas coisas que o useFetch não oferece: `refetch`, para
 * recarregar depois de uma alteração, e `url` nula, para adiar a busca enquanto o endpoint
 * depende de algo que o usuário ainda não escolheu.
 */
export default function useFetchList<T>(url: string | null) {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(url !== null);
    const [error, setError] = useState<Error | null>(null);
    const [version, setVersion] = useState(0);

    // URL nova com o componente montado: o estado é ajustado durante a renderização
    // (padrão recomendado pelo React) em vez de com setState dentro do effect.
    const [requestedUrl, setRequestedUrl] = useState(url);
    if (url !== requestedUrl) {
        setRequestedUrl(url);
        setData(null);
        setError(null);
        setLoading(url !== null);
    }

    useEffect(() => {
        if (url === null) return;

        let active = true;

        api.get<T[]>(url, { data: {} })
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

    return { data: url === null ? null : data, loading, error, refetch };
}
