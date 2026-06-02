import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import useFetch from "@/hooks/useFetch";
import type { SubjectDTO } from "@/shared/dtos/subject/SubjectDTO";

export default function SubjectRegistration() {
    const columns: DataTableColumn<SubjectDTO>[] = [];
    const filters: FilterConfig[] = [];
    const {data} = useFetch<SubjectDTO>('/subject');
    return (
        <>
            <RegistrationPage
                data={data ?? []} 
                columns={columns}
                filters={filters}
                title="Disciplinas"
                registrationRoute="/new-subject"
            >
            </RegistrationPage>  
        </>
    );
};
