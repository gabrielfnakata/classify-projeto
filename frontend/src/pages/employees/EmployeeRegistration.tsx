import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import useFetch from "@/hooks/useFetch";
import type { EmployeeDTO } from "@/shared/dtos/employees/EmployeeDTO";
import { type RoleDTO } from "@/shared/dtos/role/RoleDTO";

export default function EmployeeRegistration() {
    const {data: roles} = useFetch<RoleDTO>('/role');

    const columns: DataTableColumn<EmployeeDTO>[] = [
        {key: 'name', header: 'Nome', cell: row => row.name},
        {key: 'cpf', header: 'CPF', cell: row => row.cpf},
        {key: 'hireDate', header: 'Data de admissão', cell: row => row.hireDate}
    ];
    const filters: FilterConfig[] = [
        {name: 'name', inputType: 'text', placeholder: 'Nome', width: 25},
        {name: 'cpf', inputType: 'cpf', placeholder: 'CPF', width: 25},
        {name: 'position', inputType: 'select', placeholder: 'Cargo', width: 25,
            options: roles?.map(role => {return {label: role.description, value: role.id}})
        }
    ];
    const {data} = useFetch<EmployeeDTO>('/employee');
    return (
        <>
            <RegistrationPage
                data={data ?? []} 
                columns={columns}
                filters={filters}
                title="Funcionários"
                registrationRoute="/new-employee"
            >
            </RegistrationPage>  
        </>
    );
};
