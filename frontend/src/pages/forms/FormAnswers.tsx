import { useNavigate, useParams, useLocation } from "react-router";
import type { DataTableColumn } from "@/components/common/data-table.tsx";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import { StatusBadge } from "@/components/features/status-badge";
import useFetch from "@/hooks/useFetch";
import { formatDateLabel } from "@/shared/utils/date-formatter";
import type { FormSubmissionDTO } from "@/shared/dtos/form-submission/FormSubmissionDTO";
import { statusLabel, statusVariant } from "@/shared/models/enums/form-status.ts";
import { Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";

export default function FormAnswers() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const formTitle = location.state?.formTitle as string | undefined;

    const goToSubmission = (submission: FormSubmissionDTO) =>
        navigate(`/form-answers/${submission.formUuid}/${submission.studentUuid}`, {
            state: { submission, submissions: data ?? [] },
    });


    const columns: DataTableColumn<FormSubmissionDTO>[] = [
        {key: 'studentName', header: 'Aluno', cell: row => row.studentName},
        {key: 'startedAt', header: 'Iniciado em', cell: row => row.startedAt ? formatDateLabel(new Date(row.startedAt)) : '-'},
        {key: 'submittedAt', header: 'Enviado em', cell: row => row.submittedAt ? formatDateLabel(new Date(row.submittedAt)) : '-'},
        {key: 'correctedAt', header: 'Corrigido em', cell: row => row.correctedAt ? formatDateLabel(new Date(row.correctedAt)) : '-'},
        {key: 'status', header: 'Status', cell: row => (
                <StatusBadge variant={statusVariant[row.status]}>{statusLabel[row.status]}</StatusBadge>
            )},
        {key: 'score', header: 'Nota', cell: row => row.score ?? "-"},
        {key: 'action', header: 'Ações', cell: row => (
                <div className="flex gap-2">
                     <Tooltip>
                        <TooltipTrigger
                            onClick={() => goToSubmission(row)}
                            asChild
                        >
                            <Eye className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"/>
                        </TooltipTrigger>
                        <TooltipContent>Visualizar Respostas</TooltipContent>
                    </Tooltip>
                </div>
            )}
    ];

    const filters: FilterConfig[] = [
        {name: 'studentName', inputType: 'text', placeholder: 'Aluno', width: 50},
        {name: 'status', inputType: 'select', placeholder: 'Status', width: 50,
            options: [
                {label: "Pendente", value: "PENDING"},
                {label: "Respondido", value: "ANSWERED"},
                {label: "Corrigido", value: "CORRECTED"},
            ]
        },
    ];

    const { data } = useFetch<FormSubmissionDTO[]>(id ? `/form/${id}/submissions` : null);

    return (
        <RegistrationPage
            data={data ?? []}
            columns={columns}
            filters={filters}
            title={formTitle ? `Respostas - ${formTitle}` : "Respostas do Formulário"}
        />
    );
}
