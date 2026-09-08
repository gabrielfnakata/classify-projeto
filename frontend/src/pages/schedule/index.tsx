import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Loader2, Plus, Search } from "lucide-react"
import useFetch from "@/hooks/useFetch"

import { ScheduleForm } from "@/components/features/schedule-form"
import { ScheduleModal } from "@/components/features/schedule-modal"
import { ScheduleSeriesForm } from "@/components/features/schedule-series-form"
import { MetricCard } from "@/components/features/metric-card"
import { SectionTitle } from "@/components/features/section-title"
import { ScheduleCalendar } from "@/components/features/schedule-calendar"
import { ContentCard } from "@/components/layout/content-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO"
import { formatDateLabel, formatMonthYearLabel, formatYMD } from "@/shared/utils/date-formatter"
import { classroomNameMap, resolveClassroomName } from "@/shared/utils/class-session-helpers"
import { groupRecurrenceUuid, type SessionGroup } from "@/shared/utils/session-grouping"

type ViewMode = "day" | "week" | "month"

function sessionDate(dto: ClassSessionDTO): string {
  return formatYMD(new Date(dto.startTime as unknown as string))
}

export default function SchedulePage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: rawSessions, loading: loadingData } = useFetch<ClassSessionDTO>(`/classsession?r=${refreshKey}`)
  const { data: classrooms } = useFetch<ClassroomDTO>("/classroom")
  const classroomNames = useMemo(() => classroomNameMap(classrooms ?? []), [classrooms])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<SessionGroup | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>("day")
  const [formOpen, setFormOpen] = useState(false)
  const [editingSessions, setEditingSessions] = useState<ClassSessionDTO[] | null>(null)
  const [seriesFormOpen, setSeriesFormOpen] = useState(false)
  const [editingSeries, setEditingSeries] = useState<ClassSessionDTO[] | null>(null)

  const fetchSessions = () => setRefreshKey((k) => k + 1)

  const sessions = useMemo(() => rawSessions ?? [], [rawSessions])

  const metrics = useMemo(() => {
    const todayStr = formatYMD(new Date())
    const weekStart = new Date(currentDate)
    weekStart.setDate(currentDate.getDate() - currentDate.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const selectedStr = formatYMD(currentDate)
    const selectedDay = sessions.filter((s) => sessionDate(s) === selectedStr)

    return {
      classesToday: sessions.filter((s) => sessionDate(s) === todayStr).length,
      classesThisWeek: sessions.filter((s) => {
        const d = new Date(sessionDate(s) + "T00:00:00")
        return d >= weekStart && d <= weekEnd
      }).length,
      totalStudents: selectedDay.filter((s) => s.student).length,
      occupiedRooms: new Set(selectedDay.map((s) => s.classroomUuid)).size,
    }
  }, [sessions, currentDate])

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions
    const q = searchQuery.toLowerCase()
    return sessions.filter(
      (s) =>
        s.subjectTeacher.subject.description.toLowerCase().includes(q) ||
        s.subjectTeacher.employee.name.toLowerCase().includes(q) ||
        resolveClassroomName(classroomNames, s.classroomUuid).toLowerCase().includes(q) ||
        (s.student?.name.toLowerCase().includes(q) ?? false)
    )
  }, [sessions, searchQuery, classroomNames])

  const navigate = (dir: -1 | 1) => {
    const d = new Date(currentDate)
    if (viewMode === "week") d.setDate(d.getDate() + dir * 7)
    else if (viewMode === "month") d.setMonth(d.getMonth() + dir)
    else d.setDate(d.getDate() + dir)
    setCurrentDate(d)
  }

  const openEditForm = () => {
    setEditingSessions(selectedGroup?.sessions ?? null)
    setSelectedGroup(null)
    setFormOpen(true)
  }

  const openEditSeries = () => {
    if (!selectedGroup) return
    const recurrenceUuid = groupRecurrenceUuid(selectedGroup)
    if (!recurrenceUuid) return

    const anchor = new Date(selectedGroup.sessions[0].startTime as unknown as string)
    const seriesSessions = sessions
      .filter(
        (s) =>
          s.recurrenceGroupUuid === recurrenceUuid &&
          new Date(s.startTime as unknown as string) >= anchor
      )
      .sort(
        (a, b) =>
          new Date(a.startTime as unknown as string).getTime() - new Date(b.startTime as unknown as string).getTime()
      )

    setEditingSeries(seriesSessions)
    setSelectedGroup(null)
    setSeriesFormOpen(true)
  }

  const dateLabel =
    viewMode === "month" ? formatMonthYearLabel(currentDate) : formatDateLabel(currentDate)

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-6 md:p-8">
      <SectionTitle
        title="Agendamentos de Aula"
        description="Controle de cronograma e fluxo de alunos."
        action={
          <Button onClick={() => { setEditingSessions(null); setFormOpen(true) }}>
            <Plus />
            Novo Agendamento
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {([
          { value: metrics.classesToday,   subtitle: "Aulas Hoje",      tone: "info"    },
          { value: metrics.classesThisWeek, subtitle: "Aulas na Semana", tone: "success" },
          { value: metrics.totalStudents,  subtitle: "Alunos no Dia",   tone: "warning" },
          { value: metrics.occupiedRooms,  subtitle: "Salas Ocupadas",  tone: "danger"  },
        ] as const).map((card) => (
          <MetricCard
            key={card.subtitle}
            variant="summary"
            value={String(card.value).padStart(2, "0")}
            subtitle={card.subtitle}
            tone={card.tone}
          />
        ))}
      </div>

      <ContentCard className="p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-3 py-2">
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
            <div className="flex items-center">
              <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}><ChevronLeft /></Button>
              <Button variant="ghost" size="icon-sm" onClick={() => navigate(1)}><ChevronRight /></Button>
            </div>
            <div className="relative flex items-center">
              <span className="truncate text-sm font-medium text-foreground sm:text-base capitalize">
                {dateLabel}
              </span>
              <input
                type="date"
                value={formatYMD(currentDate)}
                onChange={(e) => e.target.value && setCurrentDate(new Date(e.target.value + "T00:00:00"))}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="h-8 w-40 pl-8 text-xs lg:w-52"
              />
            </div>
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <SelectTrigger className="hidden w-28 sm:flex"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Dia</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-b border-border px-3 py-2 sm:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar disciplina, sala, turma..."
              className="h-8 w-full pl-8 text-xs"
            />
          </div>
        </div>

        {loadingData ? (
          <div className="flex h-[600px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScheduleCalendar
            sessions={filteredSessions}
            viewMode={viewMode}
            currentDate={currentDate}
            onGroupClick={setSelectedGroup}
            classroomNames={classroomNames}
          />
        )}
      </ContentCard>

      <ScheduleModal
        group={selectedGroup}
        classroomNames={classroomNames}
        onClose={() => setSelectedGroup(null)}
        onEdit={openEditForm}
        onEditSeries={openEditSeries}
      />
      <ScheduleForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={(date) => {
          fetchSessions()
          setCurrentDate(new Date(date + "T00:00:00"))
        }}
        editingSessions={editingSessions}
      />
      <ScheduleSeriesForm
        open={seriesFormOpen}
        onClose={() => setSeriesFormOpen(false)}
        onSuccess={fetchSessions}
        sessions={editingSeries}
      />
    </div>
  )
}
