import { Plus } from "lucide-react";
import type { FilterConfig } from "./FilterRow";
import { useState } from "react";
import FilterRow from "./FilterRow";
import { DataTable, type DataTableColumn } from "../common/data-table";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";

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
        console.log(filterValues);
    }
    
    return (
        <>
            <div className="flex flex-col bg-[#88c3c03b] h-full w-full items-center justify-center">
                <div className="flex flex-col w-full h-full gap-[2vh] justify-center items-center">
                    <div className="flex flex-row w-3/5 items-center justify-between">
                        <p className="color-[#06C25D] text-xl">Registro de {title}</p>
                        <Button className="flex flex-row w-1/4 h-10 p-2 rounded-md text-white bg-[#638F8E] justify-evenly hover:cursor-pointer" onClick={() => navigate(registrationRoute)}>
                            <Plus></Plus>
                            Criar novo registro
                        </Button>
                    </div>
                    <div className="flex flex-col p-8 bg-[#B7CAC9] rounded-lg w-3/5 h-[64vh] gap-[4vh] items-center justify-center">
                        <FilterRow
                          filters={filters}
                          onSubmit={handleFilterSubmit}
                        />
                        <DataTable
                            data={data}
                            columns={columns}
                            rowKey={(row) => row.uuid}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
