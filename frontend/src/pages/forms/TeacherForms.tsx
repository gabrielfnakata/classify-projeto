import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import { StatusBadge } from "@/components/features/status-badge";
import useFetch from "@/hooks/useFetch";
import { formatDateLabel } from "@/shared/utils/date-formatter";
import type { FormDTO } from "@/shared/dtos/form/FormDTO";
import { statusLabel, statusVariant } from "@/shared/models/enums/form-status.ts";
import {useNavigate} from "react-router";
import {Eye, MessageSquareText} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import SendFormDialog from "@/components/dialogs/SendFormDialog.tsx";
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO";
import type { ClassGroupDTO } from "@/shared/dtos/class-group/ClassGroupDTO";

export default function TeacherForms() {
    const navigate = useNavigate();
    const {data: studentData} = useFetch<StudentDTO[]>('/student');
    const {data: classData} = useFetch<ClassGroupDTO[]>('/class');
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
                        onClick={() => navigate(`/form-preview/${row.uuid}`, {state: {questions: row.questions}})}
                        asChild
                    >
                        <Eye className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"/>
                    </TooltipTrigger>
                    <TooltipContent>Visualizar Formulário</TooltipContent>
                </Tooltip>
                <SendFormDialog
                    formId={row.uuid}
                    studentData={studentData ?? []}
                    classData={classData ?? []}
                />
                <Tooltip>
                    <TooltipTrigger
                        onClick={() => navigate(`/form-answers/${row.uuid}`, {state: {formTitle: row.title}})}
                        asChild
                    >
                        <MessageSquareText className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"/>
                    </TooltipTrigger>
                    <TooltipContent>Visualizar Respostas</TooltipContent>
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
