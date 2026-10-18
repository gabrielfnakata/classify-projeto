import { useEffect, useMemo, useState } from "react"
import { BookOpen, CalendarClock, GraduationCap } from "lucide-react"

import useFetch from "@/hooks/useFetch"
import api from "@/services/api"
import { MetricCard } from "@/components/features/metric-card"
import { SectionTitle } from "@/components/features/section-title"
import { ChartCard } from "@/components/features/chart-card"
import { ColumnChart } from "@/components/features/column-chart"
import { ScoreLineChart } from "@/components/features/score-line-chart"
import { CategoryBarChart } from "@/components/features/category-bar-chart"
import { CategoryDonutChart } from "@/components/features/category-donut-chart"
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
import type { AttendanceGetDTO } from "@/shared/dtos/attendance/AttendanceGetDTO"
import type { FormDTO } from "@/shared/dtos/form/FormDTO"
import { formatYMD } from "@/shared/utils/date-formatter"
import {
  buildCategoryBreakdown,
  buildDailyTrend,
  buildShiftBreakdown,
  buildWeekdayBreakdown,
  filterSessionsByPeriod,
  filterSessionsByShift,
  filterSessionsByWeekdays,
  SHIFT_LABEL_ORDER,
  hasAnyValue,
} from "@/shared/utils/session-analytics"
import { classroomNameMap, isCanceled, type ScopeOption } from "@/shared/utils/class-session-helpers"
import type { ClassGroupDTO } from "@/shared/dtos/class-group/ClassGroupDTO"
import { SegmentedTabs } from "@/components/features/segmented-tabs"
import { ClassStudentsTable } from "./ClassStudentsTable"
import { ClassTrendCharts } from "./ClassTrendCharts"
import { TrendAreaChart } from "@/components/features/trend-area-chart"
import { useClassPerformance } from "@/hooks/useClassPerformance"
import { useAuth } from "@/hooks/useAuth"
import { Roles } from "@/shared/models/enums/roles"
import {
  averageScore,
  buildAttendanceBySubject,
  buildGradeEvolution,
  getGradedForms,
  overallAttendanceRate,
} from "@/shared/utils/performance-metrics"

export default function StudentDashboard() {
  const { userData } = useAuth()
  // Aluno: só os próprios dados (/student/me). Admin: qualquer aluno ou turma.
  // O professor não usa este painel: o desempenho dos alunos dele fica no Painel do Professor.
  const isAdmin = userData?.role === Roles.ADMIN

  const { data: rawAllSessions } = useFetch<ClassSessionDTO>(isAdmin ? "/classsession" : null)
  // Aula cancelada não aconteceu: fica fora de contagens, gráficos e próximas aulas.
  const allSessions = useMemo(() => (rawAllSessions ?? []).filter((s) => !isCanceled(s)), [rawAllSessions])
  const { data: classGroups } = useFetch<ClassGroupDTO>(isAdmin ? "/class" : null)
  const { data: allStudents } = useFetch<StudentDTO>(isAdmin ? "/student" : null)

  const scope = useMemo<{ students: ScopeOption[]; classes: ScopeOption[] }>(
    () => ({
      students: (allStudents ?? []).map((s) => ({ uuid: s.uuid, name: s.name })),
      classes: (classGroups ?? []).map((c) => ({ uuid: c.uuid, name: c.name })),
    }),
    [allStudents, classGroups]
  )

  const [viewMode, setViewMode] = useState<"student" | "class">("student")
  const [selectedStudentUuid, setSelectedStudentUuid] = useState("")
  const [selectedClassUuid, setSelectedClassUuid] = useState("")
  const [ownStudent, setOwnStudent] = useState<StudentDTO | null>(null)

  useEffect(() => {
    if (isAdmin || !userData) return
    api.get<StudentDTO>("/student/me").then((response) => setOwnStudent(response.data))
  }, [isAdmin, userData])

  const isClassView = isAdmin && viewMode === "class"
  const selectedClass = scope.classes.find((c) => c.uuid === selectedClassUuid) ?? scope.classes[0] ?? null
  const student: ScopeOption | null = isAdmin
    ? scope.students.find((s) => s.uuid === selectedStudentUuid) ?? scope.students[0] ?? null
    : ownStudent
  const target = isClassView ? selectedClass : student
  const classPerformance = useClassPerformance(isClassView ? selectedClass?.uuid ?? null : null)

  const studentBaseUrl = isClassView ? null : isAdmin ? (student ? `/student/${student.uuid}` : null) : "/student/me"

  const { data: rawStudentSessions } = useFetch<ClassSessionDTO>(studentBaseUrl && `${studentBaseUrl}/schedule`)
  const studentSessions = useMemo(() => (rawStudentSessions ?? []).filter((s) => !isCanceled(s)), [rawStudentSessions])
  const { data: attendance } = useFetch<AttendanceGetDTO>(studentBaseUrl && `${studentBaseUrl}/attendance`)
  const { data: forms } = useFetch<FormDTO>(isAdmin ? studentBaseUrl && `${studentBaseUrl}/forms` : "/form")
  // /classroom é restrito a admin/professor; para o aluno a sala simplesmente não é exibida.
  const { data: classrooms } = useFetch<ClassroomDTO>(isAdmin ? "/classroom" : null)

  const allMySessions = useMemo(
    () =>
      isClassView
        ? (allSessions ?? []).filter((s) => s.classDTO?.uuid === selectedClass?.uuid)
        : studentSessions ?? [],
    [isClassView, allSessions, selectedClass, studentSessions]
  )

  const [period, setPeriod] = useState<PeriodValue>("30")
  const [shift, setShift] = useState<ShiftValue>("all")
  const [weekdays, setWeekdays] = useState<number[]>([])
  const [subjectFilter, setSubjectFilter] = useState("")
  const [teacherFilter, setTeacherFilter] = useState("")

  const classroomNames = useMemo(() => classroomNameMap(classrooms ?? []), [classrooms])

  const subjectOptions = useMemo(() => {
    const map = new Map<string, string>()
    ;(allMySessions ?? []).forEach((s) => map.set(s.subjectTeacher.subject.uuid, s.subjectTeacher.subject.description))
    return Array.from(map.entries()).map(([value, label]) => ({ label, value }))
  }, [allMySessions])

  const teacherOptions = useMemo(() => {
    const map = new Map<string, string>()
    ;(allMySessions ?? []).forEach((s) => map.set(s.subjectTeacher.employee.uuid, s.subjectTeacher.employee.name))
    return Array.from(map.entries()).map(([value, label]) => ({ label, value }))
  }, [allMySessions])

  // Aulas já filtradas por disciplina ou professor, todo o resto do painel deriva daqui.
  const mySessions = useMemo(() => {
    return (allMySessions ?? []).filter((s) => {
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

  // Sem limite: a rosca é parte-do-todo e ela mesma agrupa o excedente em "Outras".
  const sessionsBySubject = useMemo(
    () => buildCategoryBreakdown(periodSessions, (s) => s.subjectTeacher.subject.description, Infinity),
    [periodSessions]
  )
  const subjectColorOrder = useMemo(
    () => subjectOptions.map((o) => o.label).sort((a, b) => a.localeCompare(b)),
    [subjectOptions]
  )

  const sessionsByTeacher = useMemo(
    () => buildCategoryBreakdown(periodSessions, (s) => s.subjectTeacher.employee.name),
    [periodSessions]
  )

  const weekdayBreakdown = useMemo(() => buildWeekdayBreakdown(periodSessions), [periodSessions])
  const shiftBreakdown = useMemo(() => buildShiftBreakdown(periodSessions), [periodSessions])

  const gradedForms = useMemo(() => getGradedForms(forms ?? []), [forms])
  const averageGrade = useMemo(() => averageScore(gradedForms), [gradedForms])
  const gradeEvolution = useMemo(() => buildGradeEvolution(gradedForms), [gradedForms])

  const attendanceBySubject = useMemo(
    () => buildAttendanceBySubject(attendance ?? [], mySessions),
    [attendance, mySessions]
  )
  const attendanceRate = useMemo(() => overallAttendanceRate(attendance ?? []), [attendance])

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
    }
  }, [mySessions])

  return (
    <div className="animate-in fade-in space-y-6 p-6 duration-500 md:p-8">
      <SectionTitle
        title={isAdmin ? "Painel do Aluno" : "Meu Desempenho"}
        description={
          target
            ? `Aulas, notas e frequência ${isClassView ? "da turma" : "de"} ${target.name}.`
            : "Aulas, notas e frequência do aluno."
        }
        action={
          isAdmin ? (
            <div className="flex flex-wrap items-center gap-3">
              <SegmentedTabs
                size="sm"
                className="w-40"
                value={viewMode}
                onChange={(value) => {
                  setViewMode(value as "student" | "class")
                  setSubjectFilter("")
                  setTeacherFilter("")
                }}
                options={[
                  { label: "Aluno", value: "student" },
                  { label: "Turma", value: "class" },
                ]}
              />
              <SelectField
                value={target?.uuid ?? ""}
                onChange={(value) => {
                  if (isClassView) setSelectedClassUuid(value)
                  else setSelectedStudentUuid(value)
                  setSubjectFilter("")
                  setTeacherFilter("")
                }}
                placeholder={isClassView ? "Selecione uma turma" : "Selecione um aluno"}
                options={(isClassView ? scope.classes : scope.students).map((o) => ({ label: o.name, value: o.uuid }))}
                className="w-64"
              />
            </div>
          ) : null
        }
      />

      {!target ? (
        <EmptyState
          icon={GraduationCap}
          title={
            !isAdmin ? "Carregando..." : isClassView ? "Nenhuma turma disponível" : "Nenhum aluno disponível"
          }
          description={
            !isAdmin
              ? "Buscando suas informações de aluno."
              : `Cadastre ${isClassView ? "uma turma" : "um aluno"} para visualizar este painel.`
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {isClassView ? (
              <>
                <MetricCard
                  variant="summary"
                  value={classPerformance.averageGrade != null ? classPerformance.averageGrade.toFixed(1) : "—"}
                  subtitle="Nota Média da Turma"
                  tone="neutral"
                />
                <MetricCard
                  variant="summary"
                  value={classPerformance.averageAttendance != null ? `${classPerformance.averageAttendance}%` : "—"}
                  subtitle="Frequência Média"
                  tone="warning"
                />
                <MetricCard
                  variant="summary"
                  value={String(classPerformance.rows?.length ?? 0)}
                  subtitle="Alunos"
                  tone="info"
                />
                <MetricCard variant="summary" value={String(metrics.classesThisWeek)} subtitle="Aulas na Semana" tone="success" />
              </>
            ) : (
              <>
                <MetricCard variant="summary" value={String(metrics.classesToday)} subtitle="Aulas Hoje" tone="info" />
                <MetricCard variant="summary" value={String(metrics.classesThisWeek)} subtitle="Aulas na Semana" tone="success" />
                <MetricCard
                  variant="summary"
                  value={averageGrade != null ? averageGrade.toFixed(1) : "—"}
                  subtitle="Nota Média"
                  tone="neutral"
                />
                <MetricCard
                  variant="summary"
                  value={attendanceRate != null ? `${attendanceRate}%` : "—"}
                  subtitle="Frequência Geral"
                  tone="warning"
                />
              </>
            )}
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

          <div className={`grid grid-cols-1 gap-6 ${isClassView ? "" : "lg:grid-cols-2"}`}>
            <ChartCard
              title={isAdmin ? "Aulas por Dia" : "Minhas Aulas por Dia"}
              description="Volume de aulas no período selecionado."
              data={hasAnyValue(dailyTrend) ? dailyTrend : []}
            >
              <TrendAreaChart data={dailyTrend} seriesName="Aulas" />
            </ChartCard>

            {!isClassView && (
              <ChartCard
                title="Evolução das Notas"
                description="Notas dos formulários corrigidos, em ordem cronológica."
                data={gradeEvolution}
                emptyTitle="Sem notas ainda"
                emptyDescription="As notas aparecerão aqui assim que os formulários forem corrigidos."
              >
                <ScoreLineChart data={gradeEvolution} seriesName="Nota" />
              </ChartCard>
            )}
          </div>

          {isClassView && (
            <ClassTrendCharts
              gradeTrend={classPerformance.gradeTrend}
              studentCountTrend={classPerformance.studentCountTrend}
            />
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {isClassView ? (
              <ClassStudentsTable rows={classPerformance.rows} />
            ) : (
              <ChartCard
                title="Frequência por Disciplina"
                description="Percentual de presença em cada disciplina."
                data={attendanceBySubject}
                emptyTitle="Sem frequência registrada"
                emptyDescription="A frequência aparecerá aqui assim que as aulas tiverem chamada registrada."
              >
                <CategoryBarChart
                  data={attendanceBySubject}
                  seriesName="Frequência"
                  valueFormatter={(v) => `${v}%`}
                  domainMax={100}
                />
              </ChartCard>
            )}

            <ChartCard
              title="Aulas por Disciplina"
              description="Distribuição das aulas no período."
              data={sessionsBySubject}
            >
              <CategoryDonutChart
                data={sessionsBySubject}
                colorOrder={subjectColorOrder}
                seriesName="Aulas"
                centerLabel="aulas"
              />
            </ChartCard>
          </div>

          {!isClassView && (
            <ContentCard>
              <SectionTitle title={isAdmin ? "Notas" : "Minhas Notas"} className="mb-5" />

              {gradedForms.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum formulário corrigido ainda.</p>
              ) : (
                <div className="space-y-2">
                  {gradedForms.map((form) => (
                    <div
                      key={form.uuid}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-panel-soft px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-foreground">{form.title}</p>
                        <p className="text-xs text-muted-foreground">Prof. {form.teacherName}</p>
                      </div>
                      <span className="text-base font-semibold text-foreground">{form.score?.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              )}
            </ContentCard>
          )}

          <ContentCard>
            <SectionTitle title={isAdmin ? "Disciplinas" : "Minhas Disciplinas"} className="mb-5" />

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
              description={isAdmin ? "Em quais dias da semana há mais aulas." : "Em quais dias da semana você mais tem aula."}
              data={hasAnyValue(weekdayBreakdown) ? weekdayBreakdown : []}
            >
              <ColumnChart data={weekdayBreakdown} seriesName="Aulas" height={224} />
            </ChartCard>

            <ChartCard
              title="Aulas por Turno"
              description="Distribuição das aulas entre manhã, tarde e noite."
              data={hasAnyValue(shiftBreakdown) ? shiftBreakdown : []}
            >
              <CategoryDonutChart
                data={shiftBreakdown}
                colorOrder={SHIFT_LABEL_ORDER}
                seriesName="Aulas"
                centerLabel="aulas"
              />
            </ChartCard>

            <ChartCard
              title="Aulas por Professor"
              description="Quantidade de aulas com cada professor."
              data={sessionsByTeacher}
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
                description="Não há aulas futuras agendadas."
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
                        Prof. {session.subjectTeacher.employee.name}
                        {classroomNames.has(session.classroomUuid) &&
                          ` · ${classroomNames.get(session.classroomUuid)}`}
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
