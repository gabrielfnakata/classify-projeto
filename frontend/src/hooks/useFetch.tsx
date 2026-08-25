import { useEffect, useState } from "react";
import api from "@/services/api";

export function getUrlWithFilters(endpoint: string, page: number = 0, size: number = 10, filterWithValues: Map<string, string>[] = []): string {
    let url = `${endpoint}?page=${page}&size=${size}`;

    filterWithValues?.forEach((value, key) => {
        url = url.concat(`&${key}=${value}`);
    });

    return url;
}

export default function useFetch<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setLoading(true);
        api.get<T>(url, {data: {}})
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
    }, [url]);

    return { data, loading, error };
}