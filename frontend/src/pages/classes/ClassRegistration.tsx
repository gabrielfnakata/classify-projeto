import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO";

export default function ClassRegistration() {
    const CLASSSESSION_URL = "/classsession";
    const columns: DataTableColumn<ClassSessionDTO>[] = [];
    const filters: FilterConfig[] = [];

    return (
        <>
            <RegistrationPage
                columns={columns}
                url={CLASSSESSION_URL}
                filters={filters}
                title="Aulas"
                registrationRoute="/new-class-session"
            >
            </RegistrationPage>  
        </>
    );
};
