import { useMemo, useState } from "react";

import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import { NamesCell } from "@/components/features/schedule-summary-cells";
import useFetch from "@/hooks/useFetch";
import { formatTelephone, parseTelephone } from "@/shared/utils/telephone-parser";
import { sortedByName } from "@/shared/utils/sort-by-name";
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO";
import { Pencil, Trash2 } from "lucide-react";
import { NewStudentValidationSchema } from "@/validation/StudentSchema";
import { formatCpf } from "@/shared/utils/cpf-formatter";
import api from "@/services/api";
import ConfirmDeleteDialog from "@/components/common/confirm-delete-dialog";
import EditEntityDialog from "@/components/page-templates/edit-dialog/EditEntityDialog";
import type { Field } from "@/components/page-templates/form/NewEntityPage";
import type { ClassGroupDTO } from "@/shared/dtos/class-group/ClassGroupDTO";

const collator = new Intl.Collator("pt-BR", { sensitivity: "base" });

export default function StudentRegistration() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [studentToEdit, setStudentToEdit] = useState<StudentDTO | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<StudentDTO | null>(null);

    const { data, refetch } = useFetch<StudentDTO[]>(`/student?r=${refreshKey}`);
    const { data: classGroups } = useFetch<ClassGroupDTO[]>('/class');

    const handleRefresh = () => setRefreshKey(k => k + 1);

    const classGroupsByStudent = useMemo(() => {
        const map = new Map<string, string[]>();
        for (const classGroup of classGroups ?? []) {
            for (const student of classGroup.students) {
                const list = map.get(student.uuid);
                if (list) list.push(classGroup.name);
                else map.set(student.uuid, [classGroup.name]);
            }
        }
        for (const list of map.values()) list.sort(collator.compare);
        return map;
    }, [classGroups]);

    const columns: DataTableColumn<StudentDTO>[] = [
        { key: 'name', header: 'Nome', cell: row => <span className="font-medium text-foreground">{row.name}</span> },
        { key: 'email', header: 'E-mail', cell: row => row.email },
        {key: 'cpf', header: 'CPF', cell: row => formatCpf(row.cpf)},
        { key: 'telephone', header: 'Telefone', cell: row => row.telephones.length ? formatTelephone(row.telephones[0]) : <span className="text-muted-foreground">—</span> },
        { key: 'classGroups', header: 'Turmas', cell: row => <NamesCell names={classGroupsByStudent.get(row.uuid)} emptyText="Nenhuma" /> },
        {key: 'actions', header: 'Ações', cell: row => (
            <div className="flex gap-2">
                <Pencil 
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setStudentToEdit(row) }
                />
                <Trash2
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                    onClick={() => setStudentToDelete(row)}
                />
            </div> )
        },
    ];

    const filters: FilterConfig[] = [
        {name: 'name', inputType: 'text', placeholder: 'Nome', width: 25},
        {name: 'email', inputType: 'text', placeholder: 'E-mail', width: 25},
        {name: 'cpf', inputType: 'cpf', placeholder: 'CPF', width: 25},
        {name: 'telephone', inputType: 'text', placeholder: 'Telefone', width: 25},
    ];

    const editFields: Field[] = [
        {key: 'name', name: 'name', label: 'Nome', type: 'text', required: true},
        {key: 'birthDate', name: 'birthDate', label: 'Data de Nascimento', type: 'date', required: true},
        {key: 'email', name: 'email', label: 'E-mail', type: 'text', required: true},
        {key: 'cpf', name: 'cpf', label: 'CPF', type: 'cpf', required: true},
        {key: 'registrationDate', name: 'registrationDate', label: 'Data de matrícula', type: 'date', required: true},
        {key: 'telephone1', name: 'telephone1', label: 'Telefone 1', type: 'phone', required: true},
        {key: 'telephone2', name: 'telephone2', label: 'Telefone 2', type: 'phone', required: false},
    ];
    
    async function handleUpdateStudent(values: Record<string, unknown>) {
        const telephones = [values.telephone1, values.telephone2]
            .filter((phone): phone is string => Boolean(phone))
            .map(parseTelephone);

        const payload = {
            name: values.name,
            cpf: values.cpf,
            email: values.email,
            birthDate: values.birthDate,
            registrationDate: values.registrationDate,
            telephones,
            guardians: studentToEdit?.guardians ?? [],
        };

        await api.put(`/student/${studentToEdit?.uuid}`, payload);
        await refetch();
        setStudentToEdit(null);
    }

    async function handleDeleteStudent() {
        if (!studentToDelete) return;
        await api.delete(`/student/${studentToDelete.uuid}`);
        await refetch();
        setStudentToDelete(null);
    }

    return (
        <>
            <RegistrationPage
                data={sortedByName(data ?? [])}
                columns={columns}
                filters={filters}
                title="Alunos"
                registrationRoute="/new-student"
                detailRoute={(row) => `/students/${row.uuid}`}
                onRefresh={handleRefresh}
            >
            </RegistrationPage>

            <EditEntityDialog
                open={!!studentToEdit}
                onOpenChange={(open) => !open && setStudentToEdit(null)}
                title={`Editar Aluno: ${studentToEdit?.name ?? ''}`}
                fields={editFields}
                formKey={studentToEdit?.uuid}
                initialValues={{
                    name: studentToEdit?.name ?? '',
                    birthDate: studentToEdit?.birthDate ?? '',
                    email: studentToEdit?.email ?? '',
                    cpf: studentToEdit?.cpf ?? '',
                    registrationDate: studentToEdit?.registrationDate ?? '',
                    telephone1: studentToEdit?.telephones[0] ? formatTelephone(studentToEdit.telephones[0]) : '',
                    telephone2: studentToEdit?.telephones[1] ? formatTelephone(studentToEdit.telephones[1]) : '',
                }}
                validationSchema={NewStudentValidationSchema}
                onSubmit={handleUpdateStudent}
            /> 

            <ConfirmDeleteDialog
                open={!!studentToDelete}
                onOpenChange={(open) => !open && setStudentToDelete(null)}
                title="Excluir aluno"
                description={`Tem certeza que deseja excluir o aluno "${studentToDelete?.name}"? Essa ação não pode ser desfeita.`}
                onConfirm={handleDeleteStudent}
            />
             
        </>
    );
};