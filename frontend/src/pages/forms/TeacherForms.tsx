import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import { StatusBadge } from "@/components/features/status-badge";
import useFetch from "@/hooks/useFetch";
import { formatDateLabel } from "@/shared/utils/date-formatter";
import type { FormDTO } from "@/shared/dtos/form/FormDTO";
import { statusLabel, statusVariant } from "@/shared/models/enums/form-status.ts";

export default function TeacherForms() {
    const columns: DataTableColumn<FormDTO>[] = [
        {key: 'title', header: 'Título', cell: row => row.title},
        {key: 'createdAt', header: 'Data', cell: row => formatDateLabel(new Date(row.createdAt))},
        {key: 'limitDate', header: 'Data Limite', cell: row => formatDateLabel(new Date(row.limitDate))},
        {key: 'hasScore', header: 'Tipo', cell: row => row.hasScore ? "Avaliativo" : "Sem nota"},
        {key: 'questions', header: 'Questões', cell: row => row.questions},
        {key: 'score', header: 'Nota', cell: row => row.score ?? "-"},
        {key: 'status', header: 'Status', cell: row => (
            <StatusBadge variant={statusVariant[row.status]}>{statusLabel[row.status]}</StatusBadge>
        )},
    ];
    const filters: FilterConfig[] = [
        {name: 'title', inputType: 'text', placeholder: 'Título', width: 33},
        {name: 'hasScore', inputType: 'select', placeholder: 'Tipo', width: 33,
            options: [
                {label: "Todos", value: "ALL"},
                {label: "Avaliativo", value: "true"},
                {label: "Sem nota", value: "false"},
            ]
        },
        {name: 'status', inputType: 'select', placeholder: 'Status', width: 33,
            options: [
                {label: "Todos", value: "ALL"},
                {label: "Pendente", value: "PENDING"},
                {label: "Respondido", value: "ANSWERED"},
                {label: "Corrigido", value: "CORRECTED"},
            ]
        },
    ];
    const {data} = useFetch<FormDTO>('/form');
    return (
        <>
            <RegistrationPage
                data={data ?? []}
                columns={columns}
                filters={filters}
                title="Meus Formulários"
                registrationRoute="/new-form"
            >
            </RegistrationPage>
        </>
    );
};
