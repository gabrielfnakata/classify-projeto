import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import useFetch from "@/hooks/useFetch";
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "@/services/api";
import EditEntityDialog from "@/components/page-templates/edit-dialog/EditEntityDialog";
import ConfirmDeleteDialog from "@/components/common/confirm-delete-dialog";
import type { Field } from "@/components/page-templates/form/NewEntityPage";
import { NewClassroomValidationSchema } from "@/validation/ClassroomSchema";

export default function ClassroomRegistration() {
    const columns: DataTableColumn<ClassroomDTO>[] = [
        {key: 'name', header: 'Nome', cell: row => row.name},
        {key: 'capacity', header: 'Capacidade', cell: row => row.capacity},
        {key: 'isDisabled', header: 'Desativada', cell: row => {return row.isDisabled ? "Sim" : "Não"}},
        {key: 'actions', header: 'Ações', cell: row => (
            <div className="flex gap-2">
                <Pencil
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setClassroomToEdit(row)}
                />
                <Trash2
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                    onClick={() => setClassroomToDelete(row)}
                />
            </div>
        )},
    ];
    const filters: FilterConfig[] = [
        {name: 'name', inputType: 'text', placeholder: 'Nome', width: 33},
        {name: 'capacity', inputType: 'number', placeholder: 'Capacidade', width: 33},
        {name: 'isDisabled', inputType: 'select', options: [{value: "false", label: "Não"}, {value: "true", label: "Sim"}], placeholder: 'Desativada', width: 33},
    ];

    const editFields: Field[] = [
        {key: 'name', name: 'name', label: 'Nome', type: 'text', required: true},
        {key: 'capacity', name: 'capacity', label: 'Capacidade', type: 'number', required: true},
        {key: 'isDisabled', name: 'isDisabled', label: 'Desativada', type: 'select', required: true, options: [
            {label: "Sim", value: "true"}, {label: "Não", value: "false"}
        ]},
    ];

    const {data, refetch} = useFetch<ClassroomDTO>('/classroom');
    const [classroomToEdit, setClassroomToEdit] = useState<ClassroomDTO | null>(null);
    const [classroomToDelete, setClassroomToDelete] = useState<ClassroomDTO | null>(null);

    async function handleUpdateClassroom(values: Record<string, unknown>) {
        const payload = {
            name: values.name,
            capacity: Number(values.capacity),
            isDisabled: values.isDisabled === 'true' || values.isDisabled === true,
        };

        await api.put(`/classroom/${classroomToEdit?.uuid}`, payload);
        await refetch();
        setClassroomToEdit(null);
    }

    async function handleDeleteClassroom() {
        if (!classroomToDelete) return;
        await api.delete(`/classroom/${classroomToDelete.uuid}`);
        await refetch();
        setClassroomToDelete(null);
    }

    return (
        <>
            <RegistrationPage
                data={data ?? []} 
                columns={columns}
                filters={filters}
                title="Sala de Aula"
                registrationRoute="/new-classroom"
            >
            </RegistrationPage>

            <EditEntityDialog
                open={!!classroomToEdit}
                onOpenChange={(open) => !open && setClassroomToEdit(null)}
                title={`Editar Sala: ${classroomToEdit?.name ?? ''}`}
                fields={editFields}
                formKey={classroomToEdit?.uuid}
                initialValues={{
                    name: classroomToEdit?.name ?? '',
                    capacity: classroomToEdit?.capacity ?? '',
                    isDisabled: classroomToEdit ? String(classroomToEdit.isDisabled) : 'false',
                }}
                validationSchema={NewClassroomValidationSchema}
                onSubmit={handleUpdateClassroom}
            />

            <ConfirmDeleteDialog
                open={!!classroomToDelete}
                onOpenChange={(open) => !open && setClassroomToDelete(null)}
                title="Excluir sala"
                description={`Tem certeza que deseja excluir a sala "${classroomToDelete?.name}"? Essa ação não pode ser desfeita.`}
                onConfirm={handleDeleteClassroom}
            />
        </>
    );
};