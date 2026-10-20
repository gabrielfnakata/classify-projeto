import { useState } from "react";

export default function useClientPagination<T>(rows: T[] | null | undefined, initialSize = 10) {
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(initialSize);

    const totalPages = Math.max(1, Math.ceil((rows?.length ?? 0) / size));
    const currentPage = Math.min(page, totalPages - 1);

    return {
        data: rows?.slice(currentPage * size, (currentPage + 1) * size) ?? [],
        page: currentPage,
        size,
        totalPages,
        onPageChange: setPage,
        onSizeChange: (newSize: number) => {
            setSize(newSize);
            setPage(0);
        },
    };
}
