import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/wrapper/FilterRow";
import RegistrationPage from "@/components/wrapper/RegistrationPage";
import useFetch from "@/hooks/useFetch";
import type { EmployeeDTO } from "@/shared/dtos/employees/EmployeeDTO";

export default function EmployeeRegistration() {
    const columns: DataTableColumn<EmployeeDTO>[] = [
        {key: 'name', header: 'Nome', cell: row => row.name},
        {key: 'cpf', header: 'CPF', cell: row => row.cpf},
        {key: 'email', header: 'E-mail', cell: row => row.email},
        {key: 'role', header: 'Cargo', cell: row => row.role.description}
    ];
    const filters: FilterConfig[] = [
        {name: 'name', inputType: 'text', label: 'Nome', width: 25},
        {name: 'cpf', inputType: 'text', label: 'CPF', width: 25},
        {name: 'email', inputType: 'text', label: 'E-mail', width: 33},
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
