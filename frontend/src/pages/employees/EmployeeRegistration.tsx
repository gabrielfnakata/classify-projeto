import { useMemo, useState } from "react";

import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import { NamesCell, UpcomingSessionsBadge } from "@/components/features/schedule-summary-cells";
import useFetch from "@/hooks/useFetch";
import useScheduleSummary from "@/hooks/useScheduleSummary";
import { subjectsByTeacher } from "@/shared/utils/subject-teacher-index";
import { formatTelephone } from "@/shared/utils/telephone-parser";
import { sortedByName } from "@/shared/utils/sort-by-name";
import type { EmployeeDTO } from "@/shared/dtos/employees/EmployeeDTO";
import type { SubjectTeacherDTO } from "@/shared/dtos/teacher/SubjectTeacherDTO";

export default function EmployeeRegistration() {
    const [refreshKey, setRefreshKey] = useState(0);
    const handleRefresh = () => setRefreshKey(k => k + 1);

    const { data } = useFetch<EmployeeDTO>(`/employee?r=${refreshKey}`);
    const { data: links } = useFetch<SubjectTeacherDTO>('/subjectteacher');
    const scheduleByEmployee = useScheduleSummary("EMPLOYEE");

    const subjects = useMemo(() => subjectsByTeacher(links ?? []), [links]);

    const columns: DataTableColumn<EmployeeDTO>[] = [
        { key: 'name', header: 'Nome', cell: row => <span className="font-medium text-foreground">{row.name}</span> },
        { key: 'cpf', header: 'CPF', cell: row => row.cpf },
        { key: 'telephone', header: 'Telefone', cell: row => row.telephones.length ? formatTelephone(row.telephones[0]) : <span className="text-muted-foreground">—</span> },
        { key: 'subjects', header: 'Disciplinas', cell: row => <NamesCell names={subjects.get(row.uuid)} emptyText="Nenhuma" /> },
        { key: 'sessions', header: 'Aulas', cell: row => <UpcomingSessionsBadge summary={scheduleByEmployee.get(row.uuid)} /> },
    ];
    const filters: FilterConfig[] = [
        {name: 'name', inputType: 'text', placeholder: 'Nome', width: 25},
        {name: 'cpf', inputType: 'cpf', placeholder: 'CPF', width: 25},
        {name: 'email', inputType: 'text', placeholder: 'E-mail', width: 25},
        {name: 'position', inputType: 'select', placeholder: 'Cargo', width: 25,
            options: [
                {label: "Professor", value: "TEACHER"},
                {label: "Administrador", value: "ADMIN"}
            ]
        }
    ];
    return (
        <RegistrationPage
            data={sortedByName(data ?? [])}
            columns={columns}
            filters={filters}
            title="Funcionários"
            registrationRoute="/new-employee"
            detailRoute={(row) => `/employees/${row.uuid}`}
            onRefresh={handleRefresh}
        >
        </RegistrationPage>
    );
};
