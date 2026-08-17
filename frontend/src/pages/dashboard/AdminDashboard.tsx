import { useMemo, useState } from "react"
import { Link } from "react-router"
import {
  BookOpen,
  DoorOpen,
  GraduationCap,
  Plus,
  UserPlus,
  Users,
} from "lucide-react"

import useFetch from "@/hooks/useFetch"
import { MetricCard } from "@/components/features/metric-card"
import { SectionTitle } from "@/components/features/section-title"
import { EntityCard } from "@/components/features/entity-card"
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
import { Button } from "@/components/ui/button"
import {
  buildCategoryBreakdown,
  buildDailyTrend,
  buildDailyTrendFromDates,
  buildShiftBreakdown,
  buildWeekdayBreakdown,
  filterSessionsByPeriod,
  filterSessionsByShift,
  filterSessionsByWeekdays,
} from "@/shared/utils/session-analytics"
import { classroomNameMap, resolveClassroomName, sessionStudents } from "@/shared/utils/class-session-helpers"
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO"
import type { EmployeeDTO } from "@/shared/dtos/employees/EmployeeDTO"
import type { SubjectDTO } from "@/shared/dtos/subject/SubjectDTO"
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO"
import type { SubjectTeacherDTO } from "@/shared/dtos/teacher/SubjectTeacherDTO"
import type { ClassSessionDashboardDTO } from "@/shared/dtos/class-session/ClassSessionDashboardDTO"

const AGE_BUCKETS = [
  { label: "Até 10 anos", min: 0, max: 10 },
  { label: "11-13 anos", min: 11, max: 13 },
  { label: "14-16 anos", min: 14, max: 16 },
  { label: "17+ anos", min: 17, max: 200 },
]

function studentAge(birthDate: unknown, today: Date): number {
  const birth = new Date(birthDate as string)
  let age = today.getFullYear() - birth.getFullYear()
  const hadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
  if (!hadBirthdayThisYear) age -= 1
  return age
}

export default function AdminDashboard() {
  const { data: students } = useFetch<StudentDTO>("/student")
  const { data: employees } = useFetch<EmployeeDTO>("/employee")
  const { data: subjects } = useFetch<SubjectDTO>("/subject")
  const { data: classrooms } = useFetch<ClassroomDTO>("/classroom")
  const { data: subjectTeachers } = useFetch<SubjectTeacherDTO>("/subjectteacher")
  const { data: sessions } = useFetch<ClassSessionDashboardDTO>("/classsession")

  const [period, setPeriod] = useState<PeriodValue>("30")
  const [shift, setShift] = useState<ShiftValue>("all")
  const [weekdays, setWeekdays] = useState<number[]>([])
  const [subjectFilter, setSubjectFilter] = useState("")
  const [classroomFilter, setClassroomFilter] = useState("")
  const [teacherFilter, setTeacherFilter] = useState("")

  const classroomNames = useMemo(() => classroomNameMap(classrooms ?? []), [classrooms])

  const teacherOptions = useMemo(() => {
    const map = new Map<string, string>()
    ;(subjectTeachers ?? []).forEach((st) => map.set(st.employee.uuid, st.employee.name))
    return Array.from(map.entries()).map(([value, label]) => ({ label, value }))
  }, [subjectTeachers])

  const scopedSessions = useMemo(() => {
    let result = filterSessionsByPeriod(sessions ?? [], periodDays(period))
    result = filterSessionsByShift(result, shift)
    result = filterSessionsByWeekdays(result, weekdays)

    return result.filter((session) => {
      const matchesSubject = !subjectFilter || session.subjectTeacher.subject.uuid === subjectFilter
      const matchesClassroom = !classroomFilter || session.classroomUuid === classroomFilter
      const matchesTeacher = !teacherFilter || session.subjectTeacher.employee.uuid === teacherFilter
      return matchesSubject && matchesClassroom && matchesTeacher
    })
  }, [sessions, period, shift, weekdays, subjectFilter, classroomFilter, teacherFilter])

  const kpis = useMemo(() => {
    return {
      sessionsInPeriod: scopedSessions.length,
      studentsReached: new Set(scopedSessions.flatMap((s) => sessionStudents(s).map((st) => st.uuid))).size,
    }
  }, [scopedSessions])

  const dailyTrend = useMemo(
    () => buildDailyTrend(scopedSessions, periodDays(period)),
    [scopedSessions, period]
  )

  const sessionsBySubject = useMemo(
    () => buildCategoryBreakdown(scopedSessions, (s) => s.subjectTeacher.subject.description),
    [scopedSessions]
  )

  const sessionsByClassroom = useMemo(
    () => buildCategoryBreakdown(scopedSessions, (s) => resolveClassroomName(classroomNames, s.classroomUuid)),
    [scopedSessions, classroomNames]
  )

  const weekdayBreakdown = useMemo(() => buildWeekdayBreakdown(scopedSessions), [scopedSessions])
  const shiftBreakdown = useMemo(() => buildShiftBreakdown(scopedSessions), [scopedSessions])

  const studentRegistrationTrend = useMemo(
    () =>
      buildDailyTrendFromDates(
        (students ?? []).map((s) => new Date(s.registrationDate as unknown as string)),
        periodDays(period)
      ),
    [students, period]
  )

  const ageBreakdown = useMemo(() => {
    const today = new Date()
    const counts = AGE_BUCKETS.map(() => 0)

    ;(students ?? []).forEach((student) => {
      const age = studentAge(student.birthDate, today)
      const bucketIndex = AGE_BUCKETS.findIndex((b) => age >= b.min && age <= b.max)
      if (bucketIndex >= 0) counts[bucketIndex] += 1
    })

    return AGE_BUCKETS.map((bucket, i) => ({ label: bucket.label, value: counts[i] }))
  }, [students])

  const recentStudents = useMemo(() => [...(students ?? [])].slice(-20).reverse(), [students])

  const activeClassrooms = (classrooms ?? []).filter((c) => !c.isDisabled).length

  return (
    <div className="animate-in fade-in space-y-6 p-6 duration-500 md:p-8">
      <SectionTitle
        title="Painel do Administrador"
        description="Visão geral da instituição: pessoas, estrutura e aulas."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard variant="summary" value={String(students?.length ?? 0)} subtitle="Alunos" tone="info" />
        <MetricCard variant="summary" value={String(employees?.length ?? 0)} subtitle="Funcionários" tone="success" />
        <MetricCard variant="summary" value={String(subjects?.length ?? 0)} subtitle="Disciplinas" tone="neutral" />
        <MetricCard variant="summary" value={String(activeClassrooms)} subtitle="Salas Ativas" tone="warning" />
        <MetricCard variant="summary" value={String(kpis.sessionsInPeriod)} subtitle="Aulas no Período" tone="info" />
        <MetricCard variant="summary" value={String(kpis.studentsReached)} subtitle="Alunos Atendidos" tone="success" />
      </div>

      <ContentCard className="space-y-4">
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
              options={(subjects ?? []).map((s) => ({ label: s.description, value: s.uuid }))}
              className="w-40"
            />
          </FilterGroup>
          <FilterGroup label="Sala">
            <SelectField
              value={classroomFilter}
              onChange={setClassroomFilter}
              placeholder="Todas as salas"
              options={(classrooms ?? []).map((c) => ({ label: c.name, value: c.uuid }))}
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

      <ChartCard
        title="Aulas por Dia"
        description="Volume de agendamentos no período selecionado."
        data={dailyTrend}
        columns={[
          { key: "label", header: "Data", cell: (row) => row.fullLabel },
          { key: "value", header: "Aulas", cell: (row) => row.value },
        ]}
        rowKey={(row, index) => `${row.label}-${index}`}
      >
        <TrendAreaChart data={dailyTrend} seriesName="Aulas" />
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Aulas por Disciplina"
          description="Top disciplinas por volume de aulas no período."
          data={sessionsBySubject}
          columns={[
            { key: "label", header: "Disciplina", cell: (row) => row.label },
            { key: "value", header: "Aulas", cell: (row) => row.value },
          ]}
          rowKey={(row) => row.label}
        >
          <CategoryBarChart data={sessionsBySubject} seriesName="Aulas" />
        </ChartCard>

        <ChartCard
          title="Ocupação de Salas"
          description="Salas mais utilizadas no período."
          data={sessionsByClassroom}
          columns={[
            { key: "label", header: "Sala", cell: (row) => row.label },
            { key: "value", header: "Aulas", cell: (row) => row.value },
          ]}
          rowKey={(row) => row.label}
        >
          <CategoryBarChart data={sessionsByClassroom} seriesName="Aulas" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Aulas por Dia da Semana"
          description="Em qual dia da semana a escola tem mais aulas."
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

      <ChartCard
        title="Novos Alunos por Período"
        description="Matrículas registradas no período selecionado (não é afetado pelos filtros de turno/dia/aula)."
        data={studentRegistrationTrend}
        columns={[
          { key: "label", header: "Data", cell: (row) => row.fullLabel },
          { key: "value", header: "Matrículas", cell: (row) => row.value },
        ]}
        rowKey={(row, index) => `${row.label}-${index}`}
      >
        <TrendAreaChart data={studentRegistrationTrend} seriesName="Matrículas" />
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Distribuição de Idade dos Alunos"
          description="Quantidade de alunos por faixa etária."
          data={ageBreakdown}
          columns={[
            { key: "label", header: "Faixa Etária", cell: (row) => row.label },
            { key: "value", header: "Alunos", cell: (row) => row.value },
          ]}
          rowKey={(row) => row.label}
          emptyTitle="Nenhum aluno cadastrado"
        >
          <CategoryBarChart data={ageBreakdown} seriesName="Alunos" height={180} />
        </ChartCard>

        <ContentCard>
          <SectionTitle
            title="Últimos Alunos Cadastrados"
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/students">Ver todos</Link>
              </Button>
            }
            className="mb-5"
          />

          {recentStudents.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Nenhum aluno cadastrado"
              description="Os alunos cadastrados aparecerão aqui."
            />
          ) : (
            <div className="grid max-h-64 grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {recentStudents.map((student) => (
                <EntityCard
                  key={student.uuid}
                  name={student.name}
                  subtitle={student.email}
                  description={`CPF: ${student.cpf ?? "não informado"}`}
                />
              ))}
            </div>
          )}
        </ContentCard>
      </div>

      <ContentCard>
        <SectionTitle title="Ações Rápidas" className="mb-5" />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link to="/new-student">
              <UserPlus className="h-5 w-5" />
              Novo Aluno
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link to="/new-employee">
              <Users className="h-5 w-5" />
              Novo Funcionário
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link to="/new-subject">
              <BookOpen className="h-5 w-5" />
              Nova Disciplina
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link to="/new-classroom">
              <DoorOpen className="h-5 w-5" />
              Nova Sala
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link to="/schedule">
              <Plus className="h-5 w-5" />
              Agendar Aula
            </Link>
          </Button>
        </div>
      </ContentCard>
    </div>
  )
}
