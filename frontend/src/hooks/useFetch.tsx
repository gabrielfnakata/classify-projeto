import { useEffect, useState } from "react";
import api from "@/services/api";

export default function useFetch<T>(url: string) {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState<boolean | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setLoading(true);
        api.get(url, {data: {}})
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

    return {data, loading, error};
}