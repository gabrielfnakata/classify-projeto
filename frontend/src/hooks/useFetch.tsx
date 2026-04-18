import { useEffect, useState } from "react";
import api from "@/services/api";

export default function useFetch(url: string) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState<boolean | null>(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        api.get(url)
        .then((response) => {
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