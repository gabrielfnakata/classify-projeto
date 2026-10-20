import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import { StatusBadge } from "@/components/features/status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateLabel, formatYMD, toDate } from "@/shared/utils/date-formatter";
import { PenLine } from "lucide-react";
import { useNavigate } from "react-router";
import type { FormDTO } from "@/shared/dtos/form/FormDTO";
import { statusLabel, statusVariant } from "@/shared/models/enums/form-status";

export default function StudentForms() {
    const navigate = useNavigate();

    const columns: DataTableColumn<FormDTO>[] = [
        {key: 'title', header: 'Título', cell: row => row.title},
        {key: 'createdAt', header: 'Data', cell: row => formatDateLabel(toDate(row.createdAt))},
        {key: 'limitDate', header: 'Data Limite', cell: row => formatDateLabel(toDate(row.limitDate))},
        {key: 'teacherName', header: 'Postado Por', cell: row => row.teacherName},
        {key: 'hasScore', header: 'Tipo', cell: row => row.hasScore ? "Avaliativo" : "Sem nota"},
        {key: 'questions', header: 'Questões', cell: row => row.questions},
        {key: 'score', header: 'Nota', cell: row => row.score ?? "-"},
        {key: 'status', header: 'Status', cell: row => (
            <StatusBadge variant={statusVariant[row.status]}>{statusLabel[row.status]}</StatusBadge>
        )},
        {key: 'actions', header: 'Ações', cell: row => {
            const canAnswer = row.status === "PENDING" && formatYMD(new Date()) <= row.limitDate;
            if (!canAnswer) return <span className="text-muted-foreground">—</span>;

            return (
                <Tooltip>
                    <TooltipTrigger
                        onClick={() => navigate(`/submission-form/${row.formUuid}/${row.uuid}`)}
                        asChild
                    >
                        <PenLine className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"/>
                    </TooltipTrigger>
                    <TooltipContent>Responder Formulário</TooltipContent>
                </Tooltip>
            );
        }},
    ];
    const filters: FilterConfig[] = [
        {name: 'title', inputType: 'text', placeholder: 'Título', width: 25},
        {name: 'teacherName', inputType: 'text', placeholder: 'Postado por', width: 25},
        {name: 'hasScore', inputType: 'select', placeholder: 'Tipo', width: 25,
            options: [
                {label: "Todos", value: "ALL"},
                {label: "Avaliativo", value: "true"},
                {label: "Sem nota", value: "false"},
            ]
        },
        {name: 'status', inputType: 'select', placeholder: 'Status', width: 25,
            options: [
                {label: "Todos", value: "ALL"},
                {label: "Pendente", value: "PENDING"},
                {label: "Respondido", value: "ANSWERED"},
                {label: "Corrigido", value: "CORRECTED"},
            ]
        },
    ];
    return (
        <>
            <RegistrationPage
                url="/form"
                columns={columns}
                filters={filters}
                title="Meus Formulários"
            >
            </RegistrationPage>
        </>
    );
};
