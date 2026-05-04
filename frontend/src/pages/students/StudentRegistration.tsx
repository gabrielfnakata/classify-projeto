import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/wrapper/FilterRow";
import RegistrationPage from "@/components/wrapper/RegistrationPage";
import useFetch from "@/hooks/useFetch";
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO";

export default function StudentRegistration() {
    const columns: DataTableColumn<StudentDTO>[] = [];
    const filters: FilterConfig[] = [];
    const {data} = useFetch<StudentDTO>('/student');
    return (
        <>
            <RegistrationPage
                data={data ?? []} 
                columns={columns}
                filters={filters}
                title="Alunos"
                registrationRoute="/new-student"
            >
            </RegistrationPage>  
        </>
    );
};
