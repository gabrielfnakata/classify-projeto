import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import type { SubjectDTO } from "@/shared/dtos/subject/SubjectDTO";

export default function SubjectRegistration() {
    const SUBJECT_URL = "/subject";
    const columns: DataTableColumn<SubjectDTO>[] = [
        {key: 'description', header: 'Descrição', cell: row => row.description}
    ];
    const filters: FilterConfig[] = [
        {name: 'description', inputType: 'text', placeholder: 'Descrição', width: 100},
    ];
    
    return (
        <>
            <RegistrationPage
                columns={columns}
                url={SUBJECT_URL}
                filters={filters}
                title="Disciplinas"
                registrationRoute="/new-subject"
            >
            </RegistrationPage>  
        </>
    );
};
