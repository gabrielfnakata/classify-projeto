import { useState } from "react";
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
        {key: 'telephone',header: 'Telefone',
            cell: row => {
                const tel = row.telephones.at(0);
                if (!tel || !tel.number) return '';
                return tel.ddd ? `${tel.ddd}-${tel.number}` : tel.number;
            }
        },
    ];
    const filters: FilterConfig[] = [
        {name: 'name', inputType: 'text', placeholder: 'Nome', width: 25},
        {name: 'email', inputType: 'text', placeholder: 'E-mail', width: 25},
        {name: 'cpf', inputType: 'cpf', placeholder: 'CPF', width: 25},
        {name: 'telephone', inputType: 'text', placeholder: 'Telefone', width: 25},
    ];
    const [refreshKey, setRefreshKey] = useState(0);
    const {data} = useFetch<StudentDTO>(`/student?r=${refreshKey}`);

    const handleRefresh = () => setRefreshKey(k => k + 1);

    return (
        <>
            <RegistrationPage
                data={data ?? []} 
                columns={columns}
                filters={filters}
                title="Alunos"
                registrationRoute="/new-student"
                onRefresh={handleRefresh}
            >
            </RegistrationPage>  
        </>
    );
};