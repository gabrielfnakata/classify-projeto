import { useMemo } from "react";

import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import { NamesCell, UpcomingSessionsBadge } from "@/components/features/schedule-summary-cells";
import useFetch from "@/hooks/useFetch";
import useScheduleSummary from "@/hooks/useScheduleSummary";
import { teachersBySubject } from "@/shared/utils/subject-teacher-index";
import type { SubjectDTO } from "@/shared/dtos/subject/SubjectDTO";
import type { SubjectTeacherDTO } from "@/shared/dtos/teacher/SubjectTeacherDTO";

export default function SubjectRegistration() {
    const { data } = useFetch<SubjectDTO>('/subject');
    const { data: links } = useFetch<SubjectTeacherDTO>('/subjectteacher');
    const scheduleBySubject = useScheduleSummary("SUBJECT");

    const teachers = useMemo(() => teachersBySubject(links ?? []), [links]);

    const columns: DataTableColumn<SubjectDTO>[] = [
        { key: 'description', header: 'Descrição', cell: row => <span className="font-medium text-foreground">{row.description}</span> },
        { key: 'teachers', header: 'Professores', cell: row => <NamesCell names={teachers.get(row.uuid)} emptyText="Nenhum" /> },
        { key: 'sessions', header: 'Aulas', cell: row => <UpcomingSessionsBadge summary={scheduleBySubject.get(row.uuid)} /> },
    ];
    const filters: FilterConfig[] = [
        {name: 'description', inputType: 'text', placeholder: 'Descrição', width: 100},
    ];

    return (
        <RegistrationPage
            data={data ?? []}
            columns={columns}
            filters={filters}
            title="Disciplinas"
            registrationRoute="/new-subject"
            detailRoute={(row) => `/subjects/${row.uuid}`}
        >
        </RegistrationPage>
    );
};
