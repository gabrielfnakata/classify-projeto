import { useCallback, useEffect, useState } from "react";
import api from "@/services/api";

export default function useFetch<T>(url: string | null, page?: number, size?: number, filters?: object) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean | null>(null);
    const [error, setError] = useState<Error | null>(null);
    
    const fetchData = useCallback(async () => {
        if (!url) {
            setData(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const params: string = new URLSearchParams({
            ...((page !== null && page !== undefined && size !== null && size !== undefined) ? { 
                page: page.toString(),
                size: size.toString()
            } : {}),
            ...(filters ? Object.fromEntries(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
            ) : {}),
        }).toString();

        try {
            const response = await api.get<T>(`${url}?${params}`, { data: {} });
            setData(
                response.status === 204
                    ? null
                    : response.data
            );
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause
                    : new Error("Erro ao carregar dados")
            );
        } finally {
            setLoading(false);
        }
    }, [url, page, size, filters]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    return {data, loading, error, refetch: fetchData};
}
