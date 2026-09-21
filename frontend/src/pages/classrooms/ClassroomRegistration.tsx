import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import { StatusBadge } from "@/components/features/status-badge";
import { UpcomingSessionsBadge } from "@/components/features/schedule-summary-cells";
import useFetch from "@/hooks/useFetch";
import useScheduleSummary from "@/hooks/useScheduleSummary";
import { sortedByName } from "@/shared/utils/sort-by-name";
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO";

export default function ClassroomRegistration() {
    const { data } = useFetch<ClassroomDTO>('/classroom');
    const scheduleByClassroom = useScheduleSummary("CLASSROOM");

    const columns: DataTableColumn<ClassroomDTO>[] = [
        { key: 'name', header: 'Nome', cell: row => <span className="font-medium text-foreground">{row.name}</span> },
        { key: 'capacity', header: 'Capacidade', cell: row => `${row.capacity} aluno${row.capacity === 1 ? '' : 's'}` },
        {
            key: 'status', header: 'Situação',
            cell: row => row.isDisabled
                ? <StatusBadge variant="danger">Desativada</StatusBadge>
                : <StatusBadge variant="success">Ativa</StatusBadge>,
        },
        { key: 'sessions', header: 'Aulas', cell: row => <UpcomingSessionsBadge summary={scheduleByClassroom.get(row.uuid)} /> },
    ];
    const filters: FilterConfig[] = [
        {name: 'name', inputType: 'text', placeholder: 'Nome', width: 33},
        {name: 'capacity', inputType: 'number', placeholder: 'Capacidade', width: 33},
        {name: 'isDisabled', inputType: 'select', options: [{value: "false", label: "Não"}, {value: "true", label: "Sim"}], placeholder: 'Desativada', width: 33},
    ];

    return (
        <RegistrationPage
            data={sortedByName(data ?? [])}
            columns={columns}
            filters={filters}
            title="Sala de Aula"
            registrationRoute="/new-classroom"
            detailRoute={(row) => `/classrooms/${row.uuid}`}
        >
        </RegistrationPage>
    );
};
