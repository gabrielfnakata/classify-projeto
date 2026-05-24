import { useEffect, useState } from "react";
import api from "@/services/api";

export default function useFetch<T = unknown>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean | null>(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let ignore = false;

        Promise.resolve()
        .then(() => {
            if (!ignore) setLoading(true);

            return api.get(url);
        })
        .then((response) => {
            if (!ignore) setData(response.data);
        })
        .catch((error) => {
            if (!ignore) setError(error);
        })
        .finally(() => {
            if (!ignore) setLoading(false);
        })

        return () => {
            ignore = true;
        }
    }, [url]);

    return {data, loading, error};
}
