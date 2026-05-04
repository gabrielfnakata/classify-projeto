import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/wrapper/FilterRow";
import RegistrationPage from "@/components/wrapper/RegistrationPage";
import useFetch from "@/hooks/useFetch";
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO";

export default function ClassroomRegistration() {
    const columns: DataTableColumn<ClassroomDTO>[] = [];
    const filters: FilterConfig[] = [];
    const {data} = useFetch<ClassroomDTO>('/classroom');
    return (
        <>
            <RegistrationPage
                data={data ?? []} 
                columns={columns}
                filters={filters}
                title="Salas de Aula"
                registrationRoute="/new-classroom"
            >
            </RegistrationPage>  
        </>
    );
};
