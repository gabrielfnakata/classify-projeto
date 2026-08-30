import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import { StatusBadge } from "@/components/features/status-badge";
import useFetch from "@/hooks/useFetch";
import { formatDateLabel } from "@/shared/utils/date-formatter";
import type { FormDTO } from "@/shared/dtos/form/FormDTO";
import { statusLabel, statusVariant } from "@/shared/models/enums/form-status.ts";
import {useNavigate} from "react-router";
import {Eye, Send} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";

export default function TeacherForms() {
    const navigate = useNavigate();
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
        {key: 'action', header: 'Ações', cell: row => (
            <div className="flex gap-2">
                <Tooltip>
                    <TooltipTrigger
                        className="h-8 px-2 bg-button-background rounded-xl text-sm text-white font-semibold
                        hover:bg-button-highlight hover:cursor-pointer"
                        onClick={() => navigate(`/form-preview/${row.uuid}`)}
                    >
                        <Eye/>
                    </TooltipTrigger>
                    <TooltipContent>Visualizar Formulário</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger
                        className="h-8 px-2 bg-send rounded-xl text-sm text-white font-semibold
                        hover:bg-warning hover:cursor-pointer"
                        onClick={() => {alert('Essa funcionalidade ainda está em desenvolvimento.')}}
                    >
                        <Send />
                    </TooltipTrigger>
                    <TooltipContent>Enviar Formulário</TooltipContent>
                </Tooltip>
            </div>
        )}
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
    const {data} = useFetch<FormDTO[]>('/form');
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
