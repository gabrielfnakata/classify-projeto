import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import type { EmployeeDTO } from "@/shared/dtos/employees/EmployeeDTO";


export default function EmployeeRegistration() {
    const EMPLOYEE_URL: string = '/employee';
    const columns: DataTableColumn<EmployeeDTO>[] = [
        {key: 'name', header: 'Nome', cell: row => row.name},
        {key: 'cpf', header: 'CPF', cell: row => row.cpf}
    ];
    const filters: FilterConfig[] = [
        {name: 'name', inputType: 'text', placeholder: 'Nome', width: 25},
        {name: 'cpf', inputType: 'cpf', placeholder: 'CPF', width: 25},
        {name: 'email', inputType: 'text', placeholder: 'E-mail', width: 25},
        {name: 'position', inputType: 'select', placeholder: 'Cargo', width: 25,
            options: [
                {label: "Professor", value: "TEACHER"},
                {label: "Administrador", value: "ADMIN"}
            ]
        }
    ];

    return (
        <>
            <RegistrationPage
                columns={columns}
                url={EMPLOYEE_URL}
                filters={filters}
                title="Funcionários"
                registrationRoute="/new-employee"
            >
            </RegistrationPage>  
        </>
    );
};
