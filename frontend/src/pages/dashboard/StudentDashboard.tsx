import { useMemo, useState } from "react"
import { BookOpen, CalendarClock, GraduationCap } from "lucide-react"

import useFetch from "@/hooks/useFetch"
import { MetricCard } from "@/components/features/metric-card"
import { SectionTitle } from "@/components/features/section-title"
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
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO"
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
import { mockAttendance, mockGrade, mockGradeEvolution } from "@/shared/utils/mock-performance"

export default function StudentDashboard() {
  const { data: students } = useFetch<StudentDTO>("/student")
  const { data: sessions } = useFetch<ClassSessionDTO>("/classsession")
  const { data: classrooms } = useFetch<ClassroomDTO>("/classroom")

  const [selectedUuid, setSelectedUuid] = useState<string>("")
  const [period, setPeriod] = useState<PeriodValue>("30")
  const [shift, setShift] = useState<ShiftValue>("all")
  const [weekdays, setWeekdays] = useState<number[]>([])
  const [subjectFilter, setSubjectFilter] = useState("")
  const [teacherFilter, setTeacherFilter] = useState("")
  const activeStudent = (students ?? []).find((s) => s.uuid === selectedUuid) ?? (students ?? [])[0]

  const classroomNames = useMemo(() => classroomNameMap(classrooms ?? []), [classrooms])

  // Todas as aulas do aluno, usadas só para popular as disciplinas e professores dele.
  const allMySessions = useMemo(() => {
    if (!activeStudent) return []
    return (sessions ?? []).filter((s) => sessionStudents(s).some((st) => st.uuid === activeStudent.uuid))
  }, [sessions, activeStudent])

  const subjectOptions = useMemo(() => {
    const map = new Map<string, string>()
    allMySessions.forEach((s) => map.set(s.subjectTeacher.subject.uuid, s.subjectTeacher.subject.description))
    return Array.from(map.entries()).map(([value, label]) => ({ label, value }))
  }, [allMySessions])

  const teacherOptions = useMemo(() => {
    const map = new Map<string, string>()
    allMySessions.forEach((s) => map.set(s.subjectTeacher.employee.uuid, s.subjectTeacher.employee.name))
    return Array.from(map.entries()).map(([value, label]) => ({ label, value }))
  }, [allMySessions])

  // Aulas do aluno já filtradas por disciplina ou professor, todo o resto do painel deriva daqui.
  const mySessions = useMemo(() => {
    return allMySessions.filter((s) => {
      const matchesSubject = !subjectFilter || s.subjectTeacher.subject.uuid === subjectFilter
      const matchesTeacher = !teacherFilter || s.subjectTeacher.employee.uuid === teacherFilter
      return matchesSubject && matchesTeacher
    })
  }, [allMySessions, subjectFilter, teacherFilter])

  const periodSessions = useMemo(() => {
    let result = filterSessionsByPeriod(mySessions, periodDays(period))
    result = filterSessionsByShift(result, shift)
    result = filterSessionsByWeekdays(result, weekdays)
    return result
  }, [mySessions, period, shift, weekdays])

  const mySubjects = useMemo(() => {
    const map = new Map<string, { subjectUuid: string; subject: string; teacher: string }>()
    mySessions.forEach((s) => {
      map.set(s.subjectTeacher.subject.uuid, {
        subjectUuid: s.subjectTeacher.subject.uuid,
        subject: s.subjectTeacher.subject.description,
        teacher: s.subjectTeacher.employee.name,
      })
    })
    return Array.from(map.values())
  }, [mySessions])

  const upcomingSessions = useMemo(() => {
    const now = new Date()
    return mySessions
      .filter((s) => new Date(s.startTime as unknown as string) > now)
      .sort((a, b) => new Date(a.startTime as unknown as string).getTime() - new Date(b.startTime as unknown as string).getTime())
  }, [mySessions])

  const dailyTrend = useMemo(
    () => buildDailyTrend(periodSessions, periodDays(period)),
    [periodSessions, period]
  )

  const sessionsBySubject = useMemo(
    () => buildCategoryBreakdown(periodSessions, (s) => s.subjectTeacher.subject.description),
    [periodSessions]
  )

  const sessionsByTeacher = useMemo(
    () => buildCategoryBreakdown(periodSessions, (s) => s.subjectTeacher.employee.name),
    [periodSessions]
  )

  const weekdayBreakdown = useMemo(() => buildWeekdayBreakdown(periodSessions), [periodSessions])
  const shiftBreakdown = useMemo(() => buildShiftBreakdown(periodSessions), [periodSessions])

  const gradesBySubject = useMemo(
    () => mySubjects.map((s) => ({ label: s.subject, value: mockGrade(s.subject) })),
    [mySubjects]
  )

  const attendanceBySubject = useMemo(
    () => mySubjects.map((s) => ({ label: s.subject, value: mockAttendance(s.subject) })),
    [mySubjects]
  )

  // Evolução das notas
  const gradeEvolution = useMemo(() => {
    if (mySubjects.length === 0) return []

    const series = mySubjects.map((s) => mockGradeEvolution(s.subject, periodDays(period)))
    const pointCount = series[0]?.length ?? 0

    return Array.from({ length: pointCount }, (_, i) => ({
      label: series[0][i].label,
      fullLabel: series[0][i].fullLabel,
      value: Math.round((series.reduce((sum, points) => sum + points[i].value, 0) / series.length) * 10) / 10,
    }))
  }, [mySubjects, period])

  const metrics = useMemo(() => {
    const todayStr = formatYMD(new Date())
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const thisWeek = mySessions.filter((s) => {
      const d = new Date(s.startTime as unknown as string)
      return d >= weekStart && d <= weekEnd
    })

    return {
      classesToday: mySessions.filter((s) => formatYMD(new Date(s.startTime as unknown as string)) === todayStr).length,
      classesThisWeek: thisWeek.length,
      subjectsCount: mySubjects.length,
      teachersCount: new Set(mySubjects.map((s) => s.teacher)).size,
    }
  }, [mySessions, mySubjects])

  return (
    <div className="animate-in fade-in space-y-6 p-6 duration-500 md:p-8">
      <SectionTitle
        title="Painel do Aluno"
        description="Suas aulas e disciplinas."
        action={
          (students ?? []).length > 0 ? (
            <SelectField
              value={activeStudent?.uuid ?? ""}
              onChange={setSelectedUuid}
              placeholder="Selecione um aluno"
              options={(students ?? []).map((s) => ({ label: s.name, value: s.uuid }))}
              className="w-64"
            />
          ) : null
        }
      />

      {!activeStudent ? (
        <EmptyState
          icon={GraduationCap}
          title="Nenhum aluno cadastrado"
          description="Cadastre um aluno para visualizar este painel."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard variant="summary" value={String(metrics.classesToday)} subtitle="Aulas Hoje" tone="info" />
            <MetricCard variant="summary" value={String(metrics.classesThisWeek)} subtitle="Aulas na Semana" tone="success" />
            <MetricCard variant="summary" value={String(metrics.subjectsCount)} subtitle="Disciplinas" tone="neutral" />
            <MetricCard variant="summary" value={String(metrics.teachersCount)} subtitle="Professores" tone="warning" />
          </div>

          <ContentCard>
            <div className="flex flex-wrap items-end gap-3">
              <FilterGroup label="Período">
                <PeriodFilter value={period} onChange={setPeriod} />
              </FilterGroup>
              <FilterGroup label="Turno">
                <ShiftFilter value={shift} onChange={setShift} />
              </FilterGroup>
              <FilterGroup label="Dias da semana">
                <WeekdayFilter value={weekdays} onChange={setWeekdays} />
              </FilterGroup>
              <FilterGroup label="Disciplina">
                <SelectField
                  value={subjectFilter}
                  onChange={setSubjectFilter}
                  placeholder="Todas as disciplinas"
                  options={subjectOptions}
                  className="w-40"
                />
              </FilterGroup>
              <FilterGroup label="Professor">
                <SelectField
                  value={teacherFilter}
                  onChange={setTeacherFilter}
                  placeholder="Todos os professores"
                  options={teacherOptions}
                  className="w-40"
                />
              </FilterGroup>
            </div>
          </ContentCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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

            <ChartCard
              title="Evolução das Notas"
              description="Tendência de notas ao longo do período selecionado."
              data={gradeEvolution}
              columns={[
                { key: "label", header: "Data", cell: (row) => row.fullLabel },
                { key: "value", header: "Nota", cell: (row) => row.value.toFixed(1) },
              ]}
              rowKey={(row, index) => `${row.label}-${index}`}
              emptyTitle="Sem disciplinas ainda"
              emptyDescription="A evolução aparecerá aqui assim que o aluno tiver aulas registradas."
            >
              <TrendAreaChart data={gradeEvolution} seriesName="Nota" valueFormatter={(v) => v.toFixed(1)} />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ChartCard
              title="Notas por Disciplina"
              description="Média de notas em cada disciplina."
              data={gradesBySubject}
              columns={[
                { key: "label", header: "Disciplina", cell: (row) => row.label },
                { key: "value", header: "Nota", cell: (row) => row.value.toFixed(1) },
              ]}
              rowKey={(row) => row.label}
              emptyTitle="Sem disciplinas ainda"
              emptyDescription="As notas aparecerão aqui assim que o aluno tiver aulas registradas."
            >
              <CategoryBarChart data={gradesBySubject} seriesName="Nota" valueFormatter={(v) => v.toFixed(1)} />
            </ChartCard>

            <ChartCard
              title="Frequência por Disciplina"
              description="Percentual de presença em cada disciplina."
              data={attendanceBySubject}
              columns={[
                { key: "label", header: "Disciplina", cell: (row) => row.label },
                { key: "value", header: "Frequência", cell: (row) => `${row.value}%` },
              ]}
              rowKey={(row) => row.label}
              emptyTitle="Sem disciplinas ainda"
              emptyDescription="A frequência aparecerá aqui assim que o aluno tiver aulas registradas."
            >
              <CategoryBarChart data={attendanceBySubject} seriesName="Frequência" valueFormatter={(v) => `${v}%`} />
            </ChartCard>

            <ChartCard
              title="Aulas por Disciplina"
              description="Distribuição das aulas no período."
              data={sessionsBySubject}
              columns={[
                { key: "label", header: "Disciplina", cell: (row) => row.label },
                { key: "value", header: "Aulas", cell: (row) => row.value },
              ]}
              rowKey={(row) => row.label}
            >
              <CategoryBarChart data={sessionsBySubject} seriesName="Aulas" />
            </ChartCard>
          </div>

          <ContentCard>
            <SectionTitle title="Minhas Disciplinas" className="mb-5" />

            {mySubjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma disciplina vinculada.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {mySubjects.map((subject) => (
                  <div
                    key={subject.subject}
                    className="flex items-start gap-2 rounded-xl border border-border bg-panel-soft px-3 py-2.5 text-sm"
                  >
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{subject.subject}</p>
                      <p className="text-xs text-muted-foreground">Prof. {subject.teacher}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ContentCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ChartCard
              title="Aulas por Dia da Semana"
              description="Em quais dias da semana você mais tem aula."
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

            <ChartCard
              title="Aulas por Professor"
              description="Quantidade de aulas com cada professor."
              data={sessionsByTeacher}
              columns={[
                { key: "label", header: "Professor", cell: (row) => row.label },
                { key: "value", header: "Aulas", cell: (row) => row.value },
              ]}
              rowKey={(row) => row.label}
            >
              <CategoryBarChart data={sessionsByTeacher} seriesName="Aulas" height={224} />
            </ChartCard>
          </div>

          <ContentCard>
            <SectionTitle title="Próximas Aulas" className="mb-5" />

            {upcomingSessions.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="Sem aulas futuras"
                description="Não há aulas agendadas para este aluno."
              />
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.uuid}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-panel-soft p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{session.subjectTeacher.subject.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Prof. {session.subjectTeacher.employee.name} ·{" "}
                        {resolveClassroomName(classroomNames, session.classroomUuid)}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
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
