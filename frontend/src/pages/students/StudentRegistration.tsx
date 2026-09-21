import { useMemo } from "react";

import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import { NamesCell } from "@/components/features/schedule-summary-cells";
import useFetch from "@/hooks/useFetch";
import { formatTelephone } from "@/shared/utils/telephone-parser";
import { sortedByName } from "@/shared/utils/sort-by-name";
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO";
import type { ClassGroupDTO } from "@/shared/dtos/class-group/ClassGroupDTO";

const collator = new Intl.Collator("pt-BR", { sensitivity: "base" });

export default function StudentRegistration() {
    const { data } = useFetch<StudentDTO>('/student');
    const { data: classGroups } = useFetch<ClassGroupDTO>('/class');

    // aluno → nomes das turmas em que está matriculado (uma passada sobre as turmas).
    const classGroupsByStudent = useMemo(() => {
        const map = new Map<string, string[]>();
        for (const classGroup of classGroups ?? []) {
            for (const student of classGroup.students) {
                const list = map.get(student.uuid);
                if (list) list.push(classGroup.name);
                else map.set(student.uuid, [classGroup.name]);
            }
        }
        for (const list of map.values()) list.sort(collator.compare);
        return map;
    }, [classGroups]);

    const columns: DataTableColumn<StudentDTO>[] = [
        { key: 'name', header: 'Nome', cell: row => <span className="font-medium text-foreground">{row.name}</span> },
        { key: 'email', header: 'E-mail', cell: row => row.email },
        { key: 'cpf', header: 'CPF', cell: row => row.cpf },
        { key: 'telephone', header: 'Telefone', cell: row => row.telephones.length ? formatTelephone(row.telephones[0]) : <span className="text-muted-foreground">—</span> },
        { key: 'classGroups', header: 'Turmas', cell: row => <NamesCell names={classGroupsByStudent.get(row.uuid)} emptyText="Nenhuma" /> },
    ];
    const filters: FilterConfig[] = [
        {name: 'name', inputType: 'text', placeholder: 'Nome', width: 25},
        {name: 'email', inputType: 'text', placeholder: 'E-mail', width: 25},
        {name: 'cpf', inputType: 'cpf', placeholder: 'CPF', width: 25},
        {name: 'telephone', inputType: 'text', placeholder: 'Telefone', width: 25},
    ];

    return (
        <RegistrationPage
            data={sortedByName(data ?? [])}
            columns={columns}
            filters={filters}
            title="Alunos"
            registrationRoute="/new-student"
            detailRoute={(row) => `/students/${row.uuid}`}
        >
        </RegistrationPage>
    );
};
