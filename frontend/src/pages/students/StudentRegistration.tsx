import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import useFetch from "@/hooks/useFetch";
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO";

export default function StudentRegistration() {
    const columns: DataTableColumn<StudentDTO>[] = [
        {key: 'name', header: 'Nome', cell: row => row.name},
        {key: 'email', header: 'E-mail', cell: row => row.email},
        {key: 'cpf', header: 'CPF', cell: row => row.cpf},
        {key: 'telephone', header: 'Telefone', cell: row => `${row.telephones.at(0)?.ddd}-${row.telephones.at(0)?.number}`},
    ];
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
