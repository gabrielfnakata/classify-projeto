import { useMemo } from "react";
import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import { NamesCell, UpcomingSessionsBadge } from "@/components/features/schedule-summary-cells";
import useFetch from "@/hooks/useFetch";
import useScheduleSummary from "@/hooks/useScheduleSummary";
import { teachersBySubject } from "@/shared/utils/subject-teacher-index";
import type { SubjectDTO } from "@/shared/dtos/subject/SubjectDTO";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "@/services/api";
import EditEntityDialog from "@/components/page-templates/edit-dialog/EditEntityDialog";
import ConfirmDeleteDialog from "@/components/common/confirm-delete-dialog";
import type { Field } from "@/components/page-templates/form/NewEntityPage";
import { NewSubjectValidationSchema } from "@/validation/SubjectSchema";
import type { SubjectTeacherDTO } from "@/shared/dtos/teacher/SubjectTeacherDTO";
import type { PaginationDTO } from "@/shared/dtos/pagination/PaginationDTO";

export default function SubjectRegistration() {
    const SUBJECT_URL = "/subject";
    const [refreshKey, setRefreshKey] = useState(0);
    const [subjectToEdit, setSubjectToEdit] = useState<SubjectDTO | null>(null);
    const [subjectToDelete, setSubjectToDelete] = useState<SubjectDTO | null>(null);

    const { data } = useFetch<PaginationDTO<SubjectTeacherDTO>>('/subjectteacher');

    const scheduleBySubject = useScheduleSummary("SUBJECT");

    const teachers = useMemo(() => teachersBySubject(data?.content ?? []), [data?.content]);
    const handleRefresh = () => setRefreshKey((current) => current + 1);

    const columns: DataTableColumn<SubjectDTO>[] = [
        { key: 'description', header: 'Descrição', cell: row => <span className="font-medium text-foreground">{row.description}</span> },
        { key: 'teachers', header: 'Professores', cell: row => <NamesCell names={teachers.get(row.uuid)} emptyText="Nenhum" /> },
        { key: 'sessions', header: 'Aulas', cell: row => <UpcomingSessionsBadge summary={scheduleBySubject.get(row.uuid)} /> },
        { key: 'actions', header: 'Ações', cell: row =>
            (
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
            )
        },
    ];
    const filters: FilterConfig[] = [
        {name: 'description', inputType: 'text', placeholder: 'Descrição', width: 100},
    ];

    const editFields: Field[] = [
        {key: 'description', name: 'description', label: 'Descrição', type: 'text', required: true}
    ];

    async function handleUpdateSubject(values: Record<string, unknown>) {
        const payload = {
            description: values.description,
        };

        await api.put(`/subject/${subjectToEdit?.uuid}`, payload);
        handleRefresh();
        setSubjectToEdit(null);
    }

    async function handleDeleteSubject() {
        if (!subjectToDelete) return;
        await api.delete(`/subject/${subjectToDelete.uuid}`);
        handleRefresh();
        setSubjectToDelete(null);
    }

    return (
        <>
            <RegistrationPage<SubjectDTO>
                columns={columns}
                url={SUBJECT_URL}
                filters={filters}
                title="Disciplinas"
                registrationRoute="/new-subject"
                detailRoute={(row) => `/subjects/${row.uuid}`}
                refreshKey={refreshKey}
                onRefresh={handleRefresh}
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