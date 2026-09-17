import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { BookOpen, CalendarSync, ClipboardCheck, Search, Users } from "lucide-react"

import useFetch from "@/hooks/useFetch"
import { SectionTitle } from "@/components/features/section-title"
import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge } from "@/components/features/status-badge"
import { MetricCard } from "@/components/features/metric-card"
import { InitialsAvatar } from "@/components/features/initials-avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ContentCard } from "@/components/layout/content-card"
import { groupSessions } from "@/shared/utils/session-grouping"
import { describeWeekdays, weekdaysOfDates } from "@/shared/utils/recurrence"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"
import type { AttendanceSessionStatusDTO } from "@/shared/dtos/attendance/AttendanceSessionStatusDTO"

const pad = (n: number) => String(n).padStart(2, "0")
const startOf = (s: ClassSessionDTO) => new Date(s.startTime as unknown as string)

function formatDateTime(raw: unknown): string {
  const d = new Date(raw as string)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const formatDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`

interface Entry {
  key: string
  kind: "series" | "single"
  recurrenceUuid: string | null
  sessions: ClassSessionDTO[]
}

function targetNames(sessions: ClassSessionDTO[]): string[] {
  const primary = sessions[0]
  if (primary.classDTO) return [primary.classDTO.name]
  const names = new Set<string>()
  sessions.forEach((s) => s.student && names.add(s.student.name))
  return [...names]
}

function targetLabel(sessions: ClassSessionDTO[]): string {
  const primary = sessions[0]
  if (primary.classDTO) return `Turma: ${primary.classDTO.name}`
  const names = targetNames(sessions)
  if (names.length === 0) return "—"
  return names.length === 1 ? names[0] : `${names.length} alunos`
}

function AttendanceStatusIndicator({ total, marked }: { total: number; marked: number }) {
  if (marked === 0) return <StatusBadge variant="muted">Pendente</StatusBadge>
  if (marked < total) return <StatusBadge variant="warning">Parcial</StatusBadge>
  return <StatusBadge variant="success">Completa</StatusBadge>
}

export default function AttendanceOverview() {
  const { data: sessions, loading } = useFetch<ClassSessionDTO>("/classsession")
  const { data: statuses } = useFetch<AttendanceSessionStatusDTO>("/attendance/status")
  const navigate = useNavigate()
  const [search, setSearch] = useState("")

  const statusBySession = useMemo(() => {
    const map = new Map<string, AttendanceSessionStatusDTO>()
    ;(statuses ?? []).forEach((s) => map.set(s.classSessionUuid, s))
    return map
  }, [statuses])

  const entries = useMemo<Entry[]>(() => {
    const all = sessions ?? []
    const series = new Map<string, ClassSessionDTO[]>()
    const loose: ClassSessionDTO[] = []

    all.forEach((s) => {
      if (s.recurrenceGroupUuid) {
        const list = series.get(s.recurrenceGroupUuid) ?? []
        list.push(s)
        series.set(s.recurrenceGroupUuid, list)
      } else {
        loose.push(s)
      }
    })

    const seriesEntries: Entry[] = [...series.entries()].map(([uuid, list]) => ({
      key: `series:${uuid}`,
      kind: "series",
      recurrenceUuid: uuid,
      sessions: [...list].sort((a, b) => startOf(a).getTime() - startOf(b).getTime()),
    }))

    const looseEntries: Entry[] = groupSessions(loose).map((g) => ({
      key: g.key,
      kind: "single",
      recurrenceUuid: null,
      sessions: g.sessions,
    }))

    return [...seriesEntries, ...looseEntries]
  }, [sessions])

  const entryStatus = (entry: Entry) =>
    entry.sessions.reduce(
      (acc, s) => {
        const st = statusBySession.get(s.uuid)
        acc.total += st?.totalStudents ?? 0
        acc.marked += st?.markedStudents ?? 0
        return acc
      },
      { total: 0, marked: 0 }
    )

  const summary = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        const { total, marked } = entryStatus(entry)
        if (marked === 0) acc.pending += 1
        else if (marked < total) acc.partial += 1
        else acc.complete += 1
        return acc
      },
      { pending: 0, partial: 0, complete: 0 }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, statusBySession])

  const sorted = useMemo(
    () =>
      [...entries].sort(
        (a, b) =>
          startOf(b.sessions[b.sessions.length - 1]).getTime() -
          startOf(a.sessions[a.sessions.length - 1]).getTime()
      ),
    [entries]
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted
    const q = search.toLowerCase()
    return sorted.filter((entry) => {
      const p = entry.sessions[0]
      return (
        p.subjectTeacher.subject.description.toLowerCase().includes(q) ||
        p.subjectTeacher.employee.name.toLowerCase().includes(q) ||
        targetLabel(entry.sessions).toLowerCase().includes(q)
      )
    })
  }, [sorted, search])

  const openAttendance = (entry: Entry) => {
    if (entry.kind === "series" && entry.recurrenceUuid) {
      navigate(`/attendance/series/${entry.recurrenceUuid}`)
      return
    }
    const [first, ...rest] = entry.sessions
    const query = rest.length > 0 ? `?group=${rest.map((s) => s.uuid).join(",")}` : ""
    navigate(`/attendance/${first.uuid}${query}`)
  }

  return (
    <div className="animate-in fade-in space-y-6 p-6 duration-500 md:p-8">
      <SectionTitle title="Chamada" />

      <div className="grid grid-cols-3 gap-4">
        {([
          { value: summary.pending,  subtitle: "Pendentes", tone: "info"    },
          { value: summary.partial,  subtitle: "Parciais",  tone: "warning" },
          { value: summary.complete, subtitle: "Completas", tone: "success" },
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

      <ContentCard className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por disciplina, professor, aluno ou turma..."
            className="pl-8 sm:w-96"
          />
        </div>

        {!loading && filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma aula encontrada"
            description="Crie um agendamento em Agenda → Agendamentos pra poder fazer a chamada."
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => {
              const primary = entry.sessions[0]
              const last = entry.sessions[entry.sessions.length - 1]
              const { total, marked } = entryStatus(entry)
              const isClass = Boolean(primary.classDTO)
              const names = targetNames(entry.sessions)
              const visible = names.slice(0, 3)
              const overflow = names.length - visible.length
              const isSeries = entry.kind === "series"
              const pattern = isSeries
                ? describeWeekdays(weekdaysOfDates(entry.sessions.map(startOf)))
                : ""

              return (
                <div
                  key={entry.key}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-panel-soft p-4 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {isSeries ? (
                        <CalendarSync className="h-4.5 w-4.5 text-primary" />
                      ) : (
                        <BookOpen className="h-4.5 w-4.5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {primary.subjectTeacher.subject.description}
                        </p>
                        {isSeries && (
                          <StatusBadge variant="info">{entry.sessions.length} aulas</StatusBadge>
                        )}
                        <AttendanceStatusIndicator total={total} marked={marked} />
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {isSeries
                          ? `${pattern} · ${formatDate(startOf(primary))} a ${formatDate(startOf(last))} · Prof. ${primary.subjectTeacher.employee.name}`
                          : `${formatDateTime(primary.startTime)} · Prof. ${primary.subjectTeacher.employee.name}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="flex items-center gap-2">
                      {isClass ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                          <Users className="h-4 w-4 text-accent-foreground" />
                        </div>
                      ) : (
                        <div className="flex -space-x-2">
                          {visible.map((name, i) => (
                            <InitialsAvatar key={name + i} name={name} className="ring-2 ring-panel-soft" />
                          ))}
                          {overflow > 0 && (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground ring-2 ring-panel-soft">
                              +{overflow}
                            </div>
                          )}
                        </div>
                      )}
                      <span className="hidden text-sm text-muted-foreground md:inline">
                        {targetLabel(entry.sessions)}
                      </span>
                    </div>
                    <Button variant="outline" onClick={() => openAttendance(entry)}>
                      <ClipboardCheck className="h-4 w-4" />
                      Fazer Chamada
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ContentCard>
    </div>
  )
}
