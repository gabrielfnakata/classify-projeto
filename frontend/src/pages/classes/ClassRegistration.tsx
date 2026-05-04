import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/wrapper/FilterRow";
import RegistrationPage from "@/components/wrapper/RegistrationPage";
import useFetch from "@/hooks/useFetch";
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO";
import { useState } from "react";

export default function ClassRegistration() {
    const columns: DataTableColumn<ClassSessionDTO>[] = [];
    const filters: FilterConfig[] = [];
    // const [data, setData] = useState<ClassSessionDTO[]>([]);
    const {data, loading, error} = useFetch<ClassSessionDTO>('/classsession');
    return (
        <>
            <RegistrationPage
                data={data ?? []} 
                columns={columns}
                filters={filters}
                title="Aulas"
                registrationRoute="/new-class-session"
            >
            </RegistrationPage>  
        </>
    );
};
