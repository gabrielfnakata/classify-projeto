import { useState } from "react";
import { Plus } from "lucide-react";
import type { FilterConfig } from "../../filter-row/FilterRow";
import FilterRow from "../../filter-row/FilterRow";
import { DataTable, type DataTableColumn } from "../../common/data-table";
import { useNavigate } from "react-router";
import { Button } from "../../ui/button";
import { ContentCard } from "../../layout/content-card";
import { PageHeader } from "../../layout/page-header";
import useFetch from "@/hooks/useFetch";
import type { PaginationDTO } from "@/shared/dtos/pagination/PaginationDTO";

interface registrationPageProps<T> {
    title: string;
    url: string;
    filters: FilterConfig[];
    columns: DataTableColumn<T>[];
    registrationRoute: string;
} 

interface dataType {
    uuid: string;
}

function getPaginationSize(key: string): number {
    const DEFAULT_VALUE_SIZE = 10;
    const value = sessionStorage.getItem(key);

    return value ? Number(value) : DEFAULT_VALUE_SIZE;
}

export default function RegistrationPage<T extends dataType>({
    title, url, filters, columns, registrationRoute
}: registrationPageProps<T>) {
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});
    const [size, setSize] = useState<number>(getPaginationSize(url));
    const [page, setPage] = useState<number>(0);
    const navigate = useNavigate();

    const handleFilterSubmit = (values: Record<string, string>) => {
        setPage(0);
        setFilterValues(values);
    }

    const handleSizeChange = (size: number): void => {
        sessionStorage.setItem(url, size.toString());
        setSize(size);
        setPage(0);
    };
    
    const { data } = useFetch<PaginationDTO<T>>(url, page, size, filterValues);
    
    return (
        <>
            <div className="flex flex-col background h-full w-full items-center justify-center">
                <div className="flex flex-col w-full h-full gap-[2vh] justify-center items-center">
                    <div className="flex flex-row w-9/10 items-center justify-between">
                    <PageHeader
                        title={`Registro de ${title}`}
                        action={
                            <Button 
                                className="h-10 px-5 bg-button-background rounded-xl text-sm font-semibold"
                                onClick={() => navigate(registrationRoute)}
                            >
                                <Plus />
                                Criar novo registro
                            </Button>
                        }
                    />
                    </div> 
                    <ContentCard className="flex flex-col w-9/10 h-[70vh] p-8 gap-[4vh]">
                            <FilterRow
                                filters={filters}
                                onSubmit={handleFilterSubmit}
                                onValuesChange={handleFilterSubmit}
                            />
                            <DataTable
                                data={data?.content ?? []}
                                columns={columns}
                                rowKey={(row) => row.uuid}
                                totalPages={data?.totalPages ?? 1}
                                page={page}
                                size={size}
                                onPageChange={setPage}
                                onSizeChange={handleSizeChange}
                            />
                    </ContentCard>
                </div>
            </div>
        </>
    );
};
