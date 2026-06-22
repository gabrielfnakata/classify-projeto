import NewEntityPage from "@/components/page-templates/form/NewEntityPage";
import useFetch from "@/hooks/useFetch";
import api from "@/services/api";
import type { EmployeeCreateDTO } from "@/shared/dtos/employees/EmployeeCreateDTO";
import type { RoleDTO } from "@/shared/dtos/role/RoleDTO";
import { parseTelephone } from "@/shared/utils/telephone-parser";
import { NewEmployeeValidationSchema } from "@/validation/EmployeeSchema";
import { useNavigate } from "react-router";

const DEFAULT_EMPLOYEE_PASSWORD = "Mudar@123";

export default function NewEmployee() {
    const navigate = useNavigate();
    const { data: roles } = useFetch<RoleDTO>('/role');

    const fields = [
        { key: 'name', name: 'name', label: 'Nome', type: 'text' as const, required: true },
        { key: 'birthDate', name: 'birthDate', label: 'Data de nascimento', type: 'date' as const, required: true },
        { key: 'cpf', name: 'cpf', label: 'CPF', type: 'cpf' as const, required: true },
        { key: 'hireDate', name: 'hireDate', label: 'Data de contratação', type: 'date' as const, required: true },
        { key: 'email', name: 'email', label: 'E-mail', type: 'text' as const, required: true },
        {
            key: 'roleId', name: 'roleId', label: 'Cargo', type: 'select' as const, required: true,
            options: (roles ?? []).map(role => ({ label: role.description, value: role.id }))
        },
        { key: 'telephone1', name: 'telephone1', label: 'Telefone', type: 'phone' as const, required: true },
        { key: 'telephone2', name: 'telephone2', label: 'Telefone 2', type: 'phone' as const, required: false }
    ];

    const initialFormValue = {
        name: '',
        birthDate: '',
        cpf: '',
        hireDate: '',
        email: '',
        roleId: '',
        telephone1: '',
        telephone2: ''
    };

    function buildPayload(values: Record<string, unknown>): EmployeeCreateDTO {
        const telephones = [values.telephone1, values.telephone2]
            .filter((phone): phone is string => Boolean(phone))
            .map(parseTelephone);

        return {
            name: values.name as string,
            birthDate: values.birthDate as string,
            cpf: values.cpf as string,
            hireDate: values.hireDate as string,
            user: {
                email: values.email as string,
                password: DEFAULT_EMPLOYEE_PASSWORD,
                roleId: values.roleId as string,
                employeeUuid: null
            },
            telephones
        };
    }

    async function handleSubmit(payload: EmployeeCreateDTO) {
        await api.post('/employee', payload);
        navigate('/employees');
    }

    return (
        <NewEntityPage
            title="Novo Funcionário"
            fields={fields}
            backRoute="/employees"
            initialFormValue={initialFormValue}
            validationSchema={NewEmployeeValidationSchema}
            buildPayload={buildPayload}
            onSubmit={handleSubmit}
        />
    );
};
