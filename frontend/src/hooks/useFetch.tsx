import { useEffect, useState } from "react";
import api from "@/services/api";

export default function useFetch<T>(url: string, page?: number, size?: number, filters?: object) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean | null>(null);
    const [error, setError] = useState<Error | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
    
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
    
            api.get<T>(`${url}?${params}`, {data: {}})
            .then((response) => {
                if (response.status === 204) {
                    setData(null);
                    return;
                }
                
                setData(response.data);
            })
            .catch((error) => {
                setError(error);
            })
            .finally(() => {
                setLoading(false);
            })
        };

        fetchData();
    }, [url, page, size, filters]);

    return { data, loading, error };
}