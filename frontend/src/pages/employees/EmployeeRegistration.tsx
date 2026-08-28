import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import useFetch from "@/hooks/useFetch";
import type { EmployeeDTO } from "@/shared/dtos/employees/EmployeeDTO";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { RoleDTO } from "@/shared/dtos/role/RoleDTO";
import { NewEmployeeValidationSchema } from "@/validation/EmployeeSchema";
import { formatTelephone, parseTelephone } from "@/shared/utils/telephone-parser";
import { formatCpf } from "@/shared/utils/cpf-formatter";
import api from "@/services/api";
import EditEntityDialog from "@/components/page-templates/edit-dialog/EditEntityDialog";
import ConfirmDeleteDialog from "@/components/common/confirm-delete-dialog";
import type { Field } from "@/components/page-templates/form/NewEntityPage";

export default function EmployeeRegistration() {
    const columns: DataTableColumn<EmployeeDTO>[] = [
        {key: 'name', header: 'Nome', cell: row => row.name},
        {key: 'cpf', header: 'CPF', cell: row => formatCpf(row.cpf)},
        {key: 'actions',header: 'Ações', cell: row => (
            <div className="flex gap-2">
                <Pencil
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setEmployeeToEdit(row)}
                />
                <Trash2
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                    onClick={() => setEmployeeToDelete(row)}
                />
            </div> )
        },
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
    const {data, refetch} = useFetch<EmployeeDTO>('/employee');
    const {data: roles} = useFetch<RoleDTO>('/role');
    const [employeeToEdit, setEmployeeToEdit] = useState<EmployeeDTO | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeDTO | null>(null);
    const editFields: Field[] = [
            {key: 'name', name: 'name', label: 'Nome', type: 'text', required: true},
            {key: 'birthDate', name: 'birthDate', label: 'Data de nascimento', type: 'date', required: true},
            {key: 'cpf', name: 'cpf', label: 'CPF', type: 'cpf', required: true},
            {key: 'hireDate', name: 'hireDate', label: 'Data de contratação', type: 'date', required: true},
            {key: 'email', name: 'email', label: 'E-mail', type: 'text', required: true},
            {
                key: 'roleId', name: 'roleId', label: 'Cargo', type: 'select', required: true,
                options: (roles ?? []).map(role => ({label: role.description, value: role.id}))
            },
            {key: 'telephone1', name: 'telephone1', label: 'Telefone', type: 'phone', required: true},
            {key: 'telephone2', name: 'telephone2', label: 'Telefone 2', type: 'phone', required: false},
        ];

    async function handleUpdateEmployee(values: Record<string, unknown>) {
        const telephones = [values.telephone1, values.telephone2]
            .filter((phone): phone is string => Boolean(phone))
            .map(parseTelephone);

        const payload = {
            name: values.name,
            birthDate: values.birthDate,
            cpf: values.cpf,
            hireDate: values.hireDate,
            user: {
                email: values.email,
                password: null,
                roleId: values.roleId,
            },
            telephones,
        };

    await api.put(`/employee/${employeeToEdit?.uuid}`, payload);
    await refetch();
    setEmployeeToEdit(null);
}

async function handleDeleteEmployee() {
    if (!employeeToDelete) return;
    await api.delete(`/employee/${employeeToDelete.uuid}`);
    await refetch();
    setEmployeeToDelete(null);
}

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

            <EditEntityDialog
                open={!!employeeToEdit}
                onOpenChange={(open) => !open && setEmployeeToEdit(null)}
                title={`Editar Funcionário: ${employeeToEdit?.name ?? ''}`}
                fields={editFields}
                formKey={employeeToEdit?.uuid}
                initialValues={{
                    name: employeeToEdit?.name ?? '',
                    birthDate: employeeToEdit?.birthDate ?? '',
                    cpf: employeeToEdit?.cpf ?? '',
                    hireDate: employeeToEdit?.hireDate ?? '',
                    email: employeeToEdit?.email ?? '',
                    roleId: employeeToEdit?.roleId ?? '',
                    telephone1: employeeToEdit?.telephones[0] ? formatTelephone(employeeToEdit.telephones[0]) : '',
                    telephone2: employeeToEdit?.telephones[1] ? formatTelephone(employeeToEdit.telephones[1]) : '',
                }}
                validationSchema={NewEmployeeValidationSchema}
                onSubmit={handleUpdateEmployee}
            />

            <ConfirmDeleteDialog
                open={!!employeeToDelete}
                onOpenChange={(open) => !open && setEmployeeToDelete(null)}
                title="Excluir funcionário"
                description={`Tem certeza que deseja excluir o funcionário "${employeeToDelete?.name}"? Essa ação não pode ser desfeita.`}
                onConfirm={handleDeleteEmployee}
            />  
        </>
    );
};
