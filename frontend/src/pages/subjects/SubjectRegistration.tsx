import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import useFetch from "@/hooks/useFetch";
import type { SubjectDTO } from "@/shared/dtos/subject/SubjectDTO";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "@/services/api";
import EditEntityDialog from "@/components/page-templates/edit-dialog/EditEntityDialog";
import ConfirmDeleteDialog from "@/components/common/confirm-delete-dialog";
import type { Field } from "@/components/page-templates/form/NewEntityPage";
import { NewSubjectValidationSchema } from "@/validation/SubjectSchema";

export default function SubjectRegistration() {
    const columns: DataTableColumn<SubjectDTO>[] = [
        {key: 'description', header: 'Descrição', cell: row => row.description},
        {key: 'actions', header: 'Ações', cell: row => (
            <div className="flex gap-2">
                <Pencil
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setSubjectToEdit(row)}
                />
                <Trash2
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                    onClick={() => setSubjectToDelete(row)}
                />
            </div>
        )},
    ];
    const filters: FilterConfig[] = [
        {name: 'description', inputType: 'text', placeholder: 'Descrição', width: 100},
    ];

    const editFields: Field[] = [
        {key: 'description', name: 'description', label: 'Descrição', type: 'text', required: true}
    ];

    const {data, refetch} = useFetch<SubjectDTO>('/subject');
    const [subjectToEdit, setSubjectToEdit] = useState<SubjectDTO | null>(null);
    const [subjectToDelete, setSubjectToDelete] = useState<SubjectDTO | null>(null);

    async function handleUpdateSubject(values: Record<string, unknown>) {
        const payload = {
            description: values.description,
        };

        await api.put(`/subject/${subjectToEdit?.uuid}`, payload);
        await refetch();
        setSubjectToEdit(null);
    }

    async function handleDeleteSubject() {
        if (!subjectToDelete) return;
        await api.delete(`/subject/${subjectToDelete.uuid}`);
        await refetch();
        setSubjectToDelete(null);
    }

    return (
        <>
            <RegistrationPage
                data={data ?? []} 
                columns={columns}
                filters={filters}
                title="Disciplinas"
                registrationRoute="/new-subject"
            >
            </RegistrationPage>

            <EditEntityDialog
                open={!!subjectToEdit}
                onOpenChange={(open) => !open && setSubjectToEdit(null)}
                title={`Editar Disciplina: ${subjectToEdit?.description ?? ''}`}
                fields={editFields}
                formKey={subjectToEdit?.uuid}
                initialValues={{
                    description: subjectToEdit?.description ?? '',
                }}
                validationSchema={NewSubjectValidationSchema}
                onSubmit={handleUpdateSubject}
            />

            <ConfirmDeleteDialog
                open={!!subjectToDelete}
                onOpenChange={(open) => !open && setSubjectToDelete(null)}
                title="Excluir disciplina"
                description={`Tem certeza que deseja excluir a disciplina "${subjectToDelete?.description}"? Essa ação não pode ser desfeita.`}
                onConfirm={handleDeleteSubject}
            />
        </>
    );
};