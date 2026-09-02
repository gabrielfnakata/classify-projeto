import type { ReactNode } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination"
import { Field } from "../ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface DataTablePaginationProps {
    totalPages: number;
    page: number;
    size: number;
    onPageChange: (page: number) => void,
    onSizeChange: (size: number) => void
}

export default function DataTablePagination({
    totalPages = 1,
    page = 0,
    size = 10,
    onPageChange,
    onSizeChange
}: DataTablePaginationProps): ReactNode | Promise<ReactNode> {
    return (
        <div className="flex shrink-0 justify-end px-4 py-3">
            <Field orientation="horizontal" className="w-fit">
                <Select defaultValue={size.toString()} onValueChange={(v) => onSizeChange(Number(v))}>
                    <SelectTrigger className="w-20" id="select-rows-per-page" title="Quantidade de linhas por página">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start" >
                        <SelectGroup>
                            <SelectItem value="5">05</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="15">15</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>

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