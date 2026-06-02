import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import useFetch from "@/hooks/useFetch";
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO";

export default function ClassRegistration() {
    const columns: DataTableColumn<ClassSessionDTO>[] = [];
    const filters: FilterConfig[] = [];
    const {data} = useFetch<ClassSessionDTO>('/classsession');
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
