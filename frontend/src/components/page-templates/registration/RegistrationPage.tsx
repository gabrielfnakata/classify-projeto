import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
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
} 

interface dataType {
    uuid: string;
}

export default function RegistrationPage<T extends dataType>({
    title, data, filters, columns, registrationRoute
}: registrationPageProps<T>) {
    const [filterValues, setFilterValues] = useState({});
    const navigate = useNavigate();

    const handleFilterSubmit = (values: Record<string, string>) => {
        setFilterValues(values);
    }

    useEffect(() => {
        // TODO: Chamada à API com a filtragem dos dados
        console.log(filterValues);
    }, [filterValues]);
    
    return (
        <>
            <div className="flex flex-col background h-full w-full items-center justify-center">
                <div className="flex flex-col w-full h-full gap-[2vh] justify-center items-center">
                    <div className="flex flex-row w-4/5 items-center justify-between">
                    <PageHeader
                        title={`Registro de ${title}`}
                        action={
                            <Button className="h-10 px-5 rounded-xl text-sm font-semibold" onClick={() => navigate(registrationRoute)}>
                                <Plus></Plus>
                                Criar novo registro
                            </Button>
                        }
                    />
                    </div> 
                    <ContentCard className="flex flex-col w-4/5 h-[64vh] p-8 gap-[4vh]">
                            <FilterRow
                            filters={filters}
                            onSubmit={() => {}}
                            onValuesChange={handleFilterSubmit}
                            />
                            <DataTable
                                data={data}
                                columns={columns}
                                rowKey={(row) => row.uuid}
                            />
                    </ContentCard>
                </div>
            </div>
        </>
    );
};
