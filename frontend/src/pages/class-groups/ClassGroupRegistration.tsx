import { useMemo, useState } from "react";
import { Link } from "react-router";

import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import { StatusBadge } from "@/components/features/status-badge";
import useFetch from "@/hooks/useFetch";
import { describeWeekdays, weekdaysOfDates } from "@/shared/utils/recurrence";
import { sortedByName } from "@/shared/utils/sort-by-name";
import type { ClassGroupDTO } from "@/shared/dtos/class-group/ClassGroupDTO";
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO";

const pad = (n: number) => String(n).padStart(2, "0");
const startOf = (s: ClassSessionDTO) => new Date(s.startTime as unknown as string);
const fmtDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

interface SeriesInfo {
    pattern: string;
    time: string;
    from: Date;
    to: Date;
    count: number;
}

interface ScheduleInfo {
    upcoming: number;
    oneOff: number;
    series: SeriesInfo[];
}

export default function ClassGroupRegistration() {
    const { data } = useFetch<ClassGroupDTO>('/class');
    const { data: sessions } = useFetch<ClassSessionDTO>('/classsession');

    const [now] = useState(() => Date.now());

    const scheduleByClass = useMemo(() => {
        const map = new Map<string, ScheduleInfo>();

        const upcomingSessions = (sessions ?? []).filter(
            (s) => s.classDTO && startOf(s).getTime() >= now
        );

        upcomingSessions.forEach((s) => {
            const classUuid = s.classDTO!.uuid;
            const info = map.get(classUuid) ?? { upcoming: 0, oneOff: 0, series: [] };
            info.upcoming += 1;
            map.set(classUuid, info);
        });

        const byClassAndSeries = new Map<string, Map<string, ClassSessionDTO[]>>();
        upcomingSessions.forEach((s) => {
            const classUuid = s.classDTO!.uuid;
            const info = map.get(classUuid)!;
            if (!s.recurrenceGroupUuid) {
                info.oneOff += 1;
                return;
            }
            const perClass = byClassAndSeries.get(classUuid) ?? new Map<string, ClassSessionDTO[]>();
            const list = perClass.get(s.recurrenceGroupUuid) ?? [];
            list.push(s);
            perClass.set(s.recurrenceGroupUuid, list);
            byClassAndSeries.set(classUuid, perClass);
        });

        byClassAndSeries.forEach((perClass, classUuid) => {
            const info = map.get(classUuid)!;
            perClass.forEach((list) => {
                const sorted = [...list].sort((a, b) => startOf(a).getTime() - startOf(b).getTime());
                const first = sorted[0];
                info.series.push({
                    pattern: describeWeekdays(weekdaysOfDates(sorted.map(startOf))),
                    time: `${fmtTime(startOf(first))}–${fmtTime(new Date(first.endTime as unknown as string))}`,
                    from: startOf(first),
                    to: startOf(sorted[sorted.length - 1]),
                    count: sorted.length,
                });
            });
        });

        return map;
    }, [sessions, now]);

    const columns: DataTableColumn<ClassGroupDTO>[] = [
        {
            key: 'name',
            header: 'Nome',
            cell: row => (
                <Link to={`/class-groups/${row.uuid}`} className="font-medium text-primary hover:underline">
                    {row.name}
                </Link>
            ),
        },
        {
            key: 'sessions',
            header: 'Aulas',
            cell: row => {
                const info = scheduleByClass.get(row.uuid);
                if (!info || info.upcoming === 0) {
                    return <StatusBadge variant="muted">Sem aulas</StatusBadge>;
                }
                return (
                    <StatusBadge variant="success">
                        {info.upcoming} agendada{info.upcoming > 1 ? 's' : ''}
                    </StatusBadge>
                );
            },
        },
        {
            key: 'recurrence',
            header: 'Recorrência',
            cell: row => {
                const info = scheduleByClass.get(row.uuid);
                if (!info || info.series.length === 0) {
                    return (
                        <span className="text-muted-foreground">
                            {info && info.oneOff > 0
                                ? (info.oneOff > 1 ? `${info.oneOff} aulas avulsas` : '1 aula avulsa')
                                : '—'}
                        </span>
                    );
                }
                const [first, ...rest] = info.series;
                return (
                    <div className="leading-tight">
                        <p className="font-medium text-foreground">
                            {first.pattern} · {first.time}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {fmtDate(first.from)} a {fmtDate(first.to)} · {first.count} aulas
                            {rest.length > 0 && ` · +${rest.length} outra${rest.length > 1 ? 's' : ''}`}
                        </p>
                    </div>
                );
            },
        },
        { key: 'students', header: 'Alunos', cell: row => row.students.length },
    ];

    const filters: FilterConfig[] = [
        { name: 'name', inputType: 'text', placeholder: 'Nome', width: 100 },
    ];

    return (
        <RegistrationPage
            data={sortedByName(data ?? [])}
            columns={columns}
            filters={filters}
            title="Turmas"
            registrationRoute="/new-class-group"
        >
        </RegistrationPage>
    );
};
