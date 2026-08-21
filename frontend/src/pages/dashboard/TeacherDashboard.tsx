import { useMemo, useState } from "react"
import { BookOpen, CalendarClock, DoorOpen, Users } from "lucide-react"

import useFetch from "@/hooks/useFetch"
import { MetricCard } from "@/components/features/metric-card"
import { SectionTitle } from "@/components/features/section-title"
import { StatusBadge } from "@/components/features/status-badge"
import { ChartCard } from "@/components/features/chart-card"
import { TrendAreaChart } from "@/components/features/trend-area-chart"
import { CategoryBarChart } from "@/components/features/category-bar-chart"
import { PeriodFilter } from "@/components/features/period-filter"
import { ShiftFilter } from "@/components/features/shift-filter"
import { WeekdayFilter } from "@/components/features/weekday-filter"
import { FilterGroup } from "@/components/features/filter-group"
import { periodDays, type PeriodValue } from "@/lib/period-options"
import type { ShiftValue } from "@/lib/shift-options"
import { ContentCard } from "@/components/layout/content-card"
import { EmptyState } from "@/components/common/empty-state"
import { SelectField } from "@/components/common/select-field"
import type { SubjectTeacherDTO } from "@/shared/dtos/teacher/SubjectTeacherDTO"
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"
import { formatYMD } from "@/shared/utils/date-formatter"
import {
  buildCategoryBreakdown,
  buildDailyTrend,
  buildShiftBreakdown,
  buildWeekdayBreakdown,
  filterSessionsByPeriod,
  filterSessionsByShift,
  filterSessionsByWeekdays,
} from "@/shared/utils/session-analytics"
import { classroomNameMap, resolveClassroomName, sessionStudents } from "@/shared/utils/class-session-helpers"

function sessionDate(dto: ClassSessionDTO): string {
  return formatYMD(new Date(dto.startTime as unknown as string))
}

function formatTime(value: unknown): string {
  return new Date(value as string).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function TeacherDashboard() {
  const { data: subjectTeachers } = useFetch<SubjectTeacherDTO>("/subjectteacher")
  const { data: sessions } = useFetch<ClassSessionDTO>("/classsession")
  const { data: classrooms } = useFetch<ClassroomDTO>("/classroom")

  const teachers = useMemo(() => {
    const map = new Map<string, { uuid: string; name: string }>()
    ;(subjectTeachers ?? []).forEach((st) => map.set(st.employee.uuid, st.employee))
    return Array.from(map.values())
  }, [subjectTeachers])

  const classroomNames = useMemo(() => classroomNameMap(classrooms ?? []), [classrooms])

  const [selectedUuid, setSelectedUuid] = useState<string>("")
  const [period, setPeriod] = useState<PeriodValue>("30")
  const [shift, setShift] = useState<ShiftValue>("all")
  const [weekdays, setWeekdays] = useState<number[]>([])
  const activeTeacher = teachers.find((t) => t.uuid === selectedUuid) ?? teachers[0]

  const mySubjects = useMemo(() => {
    if (!activeTeacher) return []
    return (subjectTeachers ?? []).filter((st) => st.employee.uuid === activeTeacher.uuid)
  }, [subjectTeachers, activeTeacher])

  const mySessions = useMemo(() => {
    if (!activeTeacher) return []
    return (sessions ?? []).filter((s) => s.subjectTeacher.employee.uuid === activeTeacher.uuid)
  }, [sessions, activeTeacher])

  const periodSessions = useMemo(() => {
    let result = filterSessionsByPeriod(mySessions, periodDays(period))
    result = filterSessionsByShift(result, shift)
    result = filterSessionsByWeekdays(result, weekdays)
    return result
  }, [mySessions, period, shift, weekdays])

  const metrics = useMemo(() => {
    const todayStr = formatYMD(new Date())
    const today = mySessions.filter((s) => sessionDate(s) === todayStr)
    const studentsToday = new Set(today.flatMap((s) => sessionStudents(s).map((st) => st.uuid))).size

    return {
      classesToday: today.length,
      studentsToday,
      subjectsCount: mySubjects.length,
      roomsToday: new Set(today.map((s) => s.classroomUuid)).size,
    }
  }, [mySessions, mySubjects])

  const dailyTrend = useMemo(
    () => buildDailyTrend(periodSessions, periodDays(period)),
    [periodSessions, period]
  )

  const sessionsBySubject = useMemo(
    () => buildCategoryBreakdown(periodSessions, (s) => s.subjectTeacher.subject.description),
    [periodSessions]
  )

  const weekdayBreakdown = useMemo(() => buildWeekdayBreakdown(periodSessions), [periodSessions])
  const shiftBreakdown = useMemo(() => buildShiftBreakdown(periodSessions), [periodSessions])

  const todaysSessions = useMemo(() => {
    const todayStr = formatYMD(new Date())
    return mySessions
      .filter((s) => sessionDate(s) === todayStr)
      .sort((a, b) => new Date(a.startTime as unknown as string).getTime() - new Date(b.startTime as unknown as string).getTime())
  }, [mySessions])

  const upcomingSessions = useMemo(() => {
    const now = new Date()
    return mySessions
      .filter((s) => new Date(s.startTime as unknown as string) > now)
      .sort((a, b) => new Date(a.startTime as unknown as string).getTime() - new Date(b.startTime as unknown as string).getTime())
      .slice(0, 5)
  }, [mySessions])

  return (
    <div className="animate-in fade-in space-y-6 p-6 duration-500 md:p-8">
      <SectionTitle
        title="Painel do Professor"
        description="Suas aulas, disciplinas e turmas em um só lugar."
        action={
          teachers.length > 0 ? (
            <SelectField
              value={activeTeacher?.uuid ?? ""}
              onChange={setSelectedUuid}
              placeholder="Selecione um professor"
              options={teachers.map((t) => ({ label: t.name, value: t.uuid }))}
              className="w-64"
            />
          ) : null
        }
      />

      {!activeTeacher ? (
        <EmptyState
          icon={Users}
          title="Nenhum professor cadastrado"
          description="Vincule um funcionário a uma disciplina em Disciplinas para visualizar este painel."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard variant="summary" value={String(metrics.classesToday)} subtitle="Aulas Hoje" tone="info" />
            <MetricCard variant="summary" value={String(metrics.studentsToday)} subtitle="Alunos Hoje" tone="success" />
            <MetricCard variant="summary" value={String(metrics.subjectsCount)} subtitle="Disciplinas" tone="neutral" />
            <MetricCard variant="summary" value={String(metrics.roomsToday)} subtitle="Salas Hoje" tone="warning" />
          </div>

          <ContentCard>
            <div className="flex flex-wrap items-end gap-4">
              <FilterGroup label="Período">
                <PeriodFilter value={period} onChange={setPeriod} />
              </FilterGroup>
              <FilterGroup label="Turno">
                <ShiftFilter value={shift} onChange={setShift} />
              </FilterGroup>
              <FilterGroup label="Dias da semana">
                <WeekdayFilter value={weekdays} onChange={setWeekdays} />
              </FilterGroup>
            </div>
          </ContentCard>

          <ChartCard
            title="Minhas Aulas por Dia"
            description="Volume de aulas no período selecionado."
            data={dailyTrend}
            columns={[
              { key: "label", header: "Data", cell: (row) => row.fullLabel },
              { key: "value", header: "Aulas", cell: (row) => row.value },
            ]}
            rowKey={(row, index) => `${row.label}-${index}`}
          >
            <TrendAreaChart data={dailyTrend} seriesName="Aulas" />
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ChartCard
              title="Aulas por Disciplina"
              description="Distribuição das aulas no período."
              data={sessionsBySubject}
              columns={[
                { key: "label", header: "Disciplina", cell: (row) => row.label },
                { key: "value", header: "Aulas", cell: (row) => row.value },
              ]}
              rowKey={(row) => row.label}
              className="lg:col-span-2"
            >
              <CategoryBarChart data={sessionsBySubject} seriesName="Aulas" />
            </ChartCard>

            <ContentCard>
              <SectionTitle title="Minhas Disciplinas" className="mb-5" />

              {mySubjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma disciplina vinculada.</p>
              ) : (
                <div className="space-y-2">
                  {mySubjects.map((st) => (
                    <div
                      key={st.uuid}
                      className="flex items-center gap-2 rounded-xl border border-border bg-panel-soft px-3 py-2.5 text-sm"
                    >
                      <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="font-medium text-foreground">{st.subject.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </ContentCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="Aulas por Dia da Semana"
              description="Em quais dias você mais costuma dar aula."
              data={weekdayBreakdown}
              columns={[
                { key: "label", header: "Dia", cell: (row) => row.label },
                { key: "value", header: "Aulas", cell: (row) => row.value },
              ]}
              rowKey={(row) => row.label}
            >
              <CategoryBarChart data={weekdayBreakdown} seriesName="Aulas" height={224} />
            </ChartCard>

            <ChartCard
              title="Aulas por Turno"
              description="Distribuição das aulas entre manhã, tarde e noite."
              data={shiftBreakdown}
              columns={[
                { key: "label", header: "Turno", cell: (row) => row.label },
                { key: "value", header: "Aulas", cell: (row) => row.value },
              ]}
              rowKey={(row) => row.label}
            >
              <CategoryBarChart data={shiftBreakdown} seriesName="Aulas" height={224} />
            </ChartCard>
          </div>

          <ContentCard>
            <SectionTitle title="Aulas de Hoje" className="mb-5" />

            {todaysSessions.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="Sem aulas hoje"
                description="Você não possui aulas agendadas para hoje."
              />
            ) : (
              <div className="space-y-3">
                {todaysSessions.map((session) => (
                  <div
                    key={session.uuid}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-panel-soft p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{session.subjectTeacher.subject.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(session.startTime)} - {formatTime(session.endTime)} ·{" "}
                        {resolveClassroomName(classroomNames, session.classroomUuid)}
                      </p>
                    </div>
                    <StatusBadge variant="info">{sessionStudents(session).length} aluno(s)</StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </ContentCard>

          <ContentCard>
            <SectionTitle title="Próximas Aulas" className="mb-5" />

            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma aula futura agendada.</p>
            ) : (
              <div className="space-y-2">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.uuid}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-foreground">{session.subjectTeacher.subject.description}</span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <DoorOpen className="h-3.5 w-3.5" />
                      {resolveClassroomName(classroomNames, session.classroomUuid)}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(session.startTime as unknown as string).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ContentCard>
        </>
      )}
    </div>
  )
}
