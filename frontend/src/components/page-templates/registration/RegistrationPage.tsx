import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { FilterConfig } from "../../filter-row/FilterRow";
import FilterRow from "../../filter-row/FilterRow";
import { DataTable, type DataTableColumn } from "../../common/data-table";
import { useNavigate } from "react-router";
import { Button } from "../../ui/button";
import { ContentCard } from "../../layout/content-card";
import { PageHeader } from "../../layout/page-header";

interface registrationPageProps<T> {
    title: string;
    data: T[];
    filters: FilterConfig[];
    columns: DataTableColumn<T>[];
    registrationRoute: string;
    // Quando informado, cada linha ganha uma lupa que leva para a tela de detalhes.
    detailRoute?: (row: T) => string;
}

interface dataType {
    uuid: string;
}

export default function RegistrationPage<T extends dataType>({
    title, data, filters, columns, registrationRoute, detailRoute
}: registrationPageProps<T>) {
    const [filterValues, setFilterValues] = useState({});
    const navigate = useNavigate();

    const tableColumns: DataTableColumn<T>[] = detailRoute
        ? [
            ...columns,
            {
                key: 'details',
                header: <span className="sr-only">Detalhes</span>,
                className: 'w-12 text-right',
                cell: (row) => (
                    <button
                        type="button"
                        title="Ver detalhes"
                        aria-label="Ver detalhes"
                        onClick={() => navigate(detailRoute(row))}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                ),
            },
        ]
        : columns;

    const handleFilterSubmit = (values: Record<string, string>) => {
        setFilterValues(values);
    };

    useEffect(() => {
        // TODO: Chamada à API com a filtragem dos dados
    }, [filterValues]);

    return (
        <>
            <div className="flex flex-col background h-full w-full items-center justify-center">
                <div className="flex flex-col w-full h-full gap-[2vh] justify-center items-center">
                    <div className="flex flex-row w-9/10 items-center justify-between">
                    <PageHeader
                        title={`Registro de ${title}`}
                        action={
                            <Button className="h-10 px-5 bg-button-background rounded-xl text-sm font-semibold" onClick={() => navigate(registrationRoute)}>
                                <Plus></Plus>
                                Criar novo registro
                            </Button>
                        }
                    />
                    </div>
                    <ContentCard className="flex flex-col w-9/10 h-[70vh] p-8 gap-[4vh]">
                            <FilterRow
                            filters={filters}
                            onSubmit={() => {}}
                            onValuesChange={handleFilterSubmit}
                            />
                            <DataTable
                                data={data}
                                columns={tableColumns}
                                rowKey={(row) => row.uuid}
                            />
                    </ContentCard>
                </div>
            </div>
        </>
    );
};
