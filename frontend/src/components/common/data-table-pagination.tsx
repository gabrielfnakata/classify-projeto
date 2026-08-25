import type { ReactNode } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination"

interface DataTablePaginationProps {
    totalPages: number;
    page: number;
    onPageChange: (page: number) => void
}

export default function DataTablePagination({
    totalPages = 1,
    page = 0,
    onPageChange
}: DataTablePaginationProps): ReactNode | Promise<ReactNode> {
    return (
        <div className="flex shrink-0 justify-end px-4 py-3">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious 
                            onClick={() => {
                                if (page > 0) {
                                    onPageChange(page - 1);
                                }
                            }} 
                            className={
                                (page === 0)
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                            }
                        />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, c) => (
                        <PaginationItem key={c}>
                            <PaginationLink 
                                isActive={page === c}
                                onClick={() => onPageChange(c)}
                                className="cursor-pointer"
                            >
                                {c + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext 
                            onClick={() => {
                                if (page < totalPages - 1) {
                                    onPageChange(page + 1);
                                }
                            }}
                            className={
                                (page === (totalPages - 1))
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}