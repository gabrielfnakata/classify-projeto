import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { ArrowLeft, ClipboardCheck, Loader2, TriangleAlert } from "lucide-react"

import api from "@/services/api"
import { SectionTitle } from "@/components/features/section-title"
import { InitialsAvatar } from "@/components/features/initials-avatar"
import { AttendanceStatusCell } from "@/components/features/attendance-status-cell"
import { EmptyState } from "@/components/common/empty-state"
import { Button } from "@/components/ui/button"
import { ContentCard } from "@/components/layout/content-card"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"
import type {
  AttendanceRosterEntryDTO,
  AttendanceStatus,
  JustificationReason,
} from "@/shared/dtos/attendance/AttendanceRosterEntryDTO"
import type { AttendanceRecordInputDTO } from "@/shared/dtos/attendance/AttendanceRecordInputDTO"
import { describeWeekdays, weekdaysOfDates } from "@/shared/utils/recurrence"

interface CellState {
  status: AttendanceStatus | null
  justificationReason: JustificationReason | null
  justificationNote: string | null
}

const pad = (n: number) => String(n).padStart(2, "0")
const toHHMM = (raw: unknown) => {
  const d = new Date(raw as string)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const DAY_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]
const cellKey = (sessionUuid: string, studentUuid: string) => `${sessionUuid}|${studentUuid}`

export default function AttendanceSeriesPage() {
  const { recurrenceUuid } = useParams<{ recurrenceUuid: string }>()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState<ClassSessionDTO[] | null>(null)
  const [rosters, setRosters] = useState<Map<string, AttendanceRosterEntryDTO[]>>(new Map())
  const [cells, setCells] = useState<Record<string, CellState>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!recurrenceUuid) return
    let cancelled = false
    setLoading(true)

    api
      .get<ClassSessionDTO[]>("/classsession", { data: {} })
      .then(async (res) => {
        const series = (res.data ?? [])
          .filter((s) => s.recurrenceGroupUuid === recurrenceUuid)
          .sort(
            (a, b) =>
              new Date(a.startTime as unknown as string).getTime() -
              new Date(b.startTime as unknown as string).getTime()
          )

        const entries = await Promise.all(
          series.map((s) =>
            api
              .get<AttendanceRosterEntryDTO[]>(`/attendance/session/${s.uuid}`, { data: {} })
              .then((r) => [s.uuid, r.status === 204 ? [] : r.data] as const)
              .catch(() => [s.uuid, [] as AttendanceRosterEntryDTO[]] as const)
          )
        )
        if (cancelled) return

        const map = new Map<string, AttendanceRosterEntryDTO[]>(entries)
        const initial: Record<string, CellState> = {}
        entries.forEach(([sessionUuid, roster]) => {
          roster.forEach((entry) => {
            initial[cellKey(sessionUuid, entry.studentUuid)] = {
              status: entry.status,
              justificationReason: entry.justificationReason,
              justificationNote: entry.justificationNote,
            }
          })
        })

        setSessions(series)
        setRosters(map)
        setCells(initial)
      })
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [recurrenceUuid, refreshKey])

  const students = useMemo(() => {
    const byUuid = new Map<string, string>()
    rosters.forEach((roster) => roster.forEach((e) => byUuid.set(e.studentUuid, e.studentName)))
    return [...byUuid.entries()]
      .map(([uuid, name]) => ({ uuid, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
  }, [rosters])

  const inSession = (sessionUuid: string, studentUuid: string) =>
    (rosters.get(sessionUuid) ?? []).some((e) => e.studentUuid === studentUuid)

  const setCellStatus = (sessionUuid: string, studentUuid: string, next: AttendanceStatus | null) => {
    if (!inSession(sessionUuid, studentUuid)) return
    const key = cellKey(sessionUuid, studentUuid)
    setCells((prev) => ({
      ...prev,
      [key]: {
        status: next,
        justificationReason: next === "AUSENTE" ? (prev[key]?.justificationReason ?? null) : null,
        justificationNote: next === "AUSENTE" ? (prev[key]?.justificationNote ?? null) : null,
      },
    }))
  }

  const markColumn = (sessionUuid: string, status: AttendanceStatus) => {
    setCells((prev) => {
      const next = { ...prev }
      ;(rosters.get(sessionUuid) ?? []).forEach((e) => {
        const key = cellKey(sessionUuid, e.studentUuid)
        next[key] = {
          status,
          justificationReason: status === "AUSENTE" ? (prev[key]?.justificationReason ?? null) : null,
          justificationNote: status === "AUSENTE" ? (prev[key]?.justificationNote ?? null) : null,
        }
      })
      return next
    })
  }

  const summary = useMemo(() => {
    let present = 0, absent = 0, unmarked = 0
    ;(sessions ?? []).forEach((s) =>
      (rosters.get(s.uuid) ?? []).forEach((e) => {
        const st = cells[cellKey(s.uuid, e.studentUuid)]?.status ?? null
        if (st === "PRESENTE") present += 1
        else if (st === "AUSENTE") absent += 1
        else unmarked += 1
      })
    )
    return { present, absent, unmarked }
  }, [sessions, rosters, cells])

  const handleSave = async () => {
    if (!sessions || sessions.length === 0) return
    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    const toClear: string[] = []

    const perSession = sessions
      .map((s) => {
        const records: AttendanceRecordInputDTO[] = []
        ;(rosters.get(s.uuid) ?? []).forEach((entry) => {
          const cell = cells[cellKey(s.uuid, entry.studentUuid)]
          if (cell?.status) {
            records.push({
              studentUuid: entry.studentUuid,
              status: cell.status,
              justificationReason: cell.justificationReason,
              justificationNote: cell.justificationNote,
            })
          } else if (entry.attendanceUuid) {
            toClear.push(entry.attendanceUuid)
          }
        })
        return { uuid: s.uuid, records }
      })
      .filter((s) => s.records.length > 0)

    if (perSession.length === 0 && toClear.length === 0) {
      setError("Marque ao menos uma presença ou falta antes de salvar.")
      setSubmitting(false)
      return
    }

    try {
      const results = await Promise.allSettled([
        ...perSession.map((s) => api.put(`/attendance/session/${s.uuid}`, { records: s.records })),
        ...toClear.map((attendanceUuid) => api.delete(`/attendance/${attendanceUuid}`, { data: {} })),
      ])
      const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[]
      if (failed.length > 0) {
        const reason = failed[0].reason as { response?: { data?: { mensagem?: string } } }
        const message = reason?.response?.data?.mensagem ?? "Erro ao salvar a chamada."
        setError(`${results.length - failed.length} de ${results.length} alterações salvas. Uma falhou: ${message}`)
      } else {
        setSuccessMessage(
          perSession.length > 0
            ? `Chamada salva para ${perSession.length} data(s).`
            : "Marcações removidas."
        )
      }
      setRefreshKey((k) => k + 1)
    } finally {
      setSubmitting(false)
    }
  }

  const targetOf = (s: ClassSessionDTO) => s.classDTO?.name ?? s.student?.name ?? "—"

  const mixedTargets = useMemo(() => {
    const counts = new Map<string, number>()
    ;(sessions ?? []).forEach((s) => {
      const name = targetOf(s)
      counts.set(name, (counts.get(name) ?? 0) + 1)
    })
    if (counts.size < 2) return null
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, n]) => `${name} (${n} aula${n > 1 ? "s" : ""})`)
  }, [sessions])

  const primary = sessions?.[0] ?? null
  const pattern = useMemo(() => {
    if (!sessions || sessions.length === 0) return ""
    const days = weekdaysOfDates(sessions.map((s) => new Date(s.startTime as unknown as string)))
    return describeWeekdays(days)
  }, [sessions])

  return (
    <div className="animate-in fade-in space-y-6 p-6 duration-500 md:p-8">
      <SectionTitle
        title="Chamada da série"
        description={
          primary
            ? `${primary.subjectTeacher.subject.description} · ${pattern} · ${toHHMM(primary.startTime)}–${toHHMM(primary.endTime)} · ${sessions?.length} aulas`
            : "Carregando série..."
        }
        action={
          <Button variant="outline" onClick={() => navigate("/attendance")}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        }
      />

      {mixedTargets && (
        <div className="flex items-start gap-2.5 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1">
            Essa recorrência não é toda da mesma turma: {mixedTargets.join(" e ")}. A tabela mostra
            todos os alunos envolvidos, mas cada data só aceita marcação dos alunos da turma daquele
            dia — por isso algumas células ficam bloqueadas.
          </p>
        </div>
      )}

      <ContentCard className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            {summary.present} presenças
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            {summary.absent} faltas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            {summary.unmarked} sem marcação
          </span>
          <span className="ml-auto hidden sm:inline">
            {(sessions?.length ?? 0) > 8
              ? "Role a tabela para o lado para ver todas as datas · clique numa célula para alternar"
              : "Clique numa célula para alternar presença → falta → em branco"}
          </span>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !sessions || sessions.length === 0 || students.length === 0 ? (
          <EmptyState
            title="Série não encontrada"
            description="Essa recorrência não tem aulas ou alunos vinculados."
          />
        ) : (
          <div className="overflow-x-auto scrollbar-slim">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 min-w-[180px] border-b border-r border-border bg-card p-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shadow-[4px_0_6px_-4px_rgba(0,0,0,0.15)]">
                    Aluno
                  </th>
                  {sessions.map((s) => {
                    const d = new Date(s.startTime as unknown as string)
                    return (
                      <th key={s.uuid} className="border-b border-border bg-card p-1 align-bottom">
                        <button
                          type="button"
                          onClick={() => markColumn(s.uuid, "PRESENTE")}
                          title={
                            mixedTargets
                              ? `${targetOf(s)} — marcar todos presentes nesta data`
                              : "Marcar todos presentes nesta data"
                          }
                          className="mx-auto flex w-14 flex-col items-center rounded-md px-1 py-1 transition-colors hover:bg-accent"
                        >
                          <span className="text-[10px] uppercase text-muted-foreground">
                            {DAY_SHORT[d.getDay()]}
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {pad(d.getDate())}/{pad(d.getMonth() + 1)}
                          </span>
                        </button>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.uuid} className="group">
                    <td className="sticky left-0 z-10 border-b border-r border-border bg-card p-2 shadow-[4px_0_6px_-4px_rgba(0,0,0,0.15)]">
                      <div className="flex min-w-0 items-center gap-2">
                        <InitialsAvatar name={student.name} className="h-7 w-7 text-[10px]" />
                        <span className="truncate font-medium text-foreground">{student.name}</span>
                      </div>
                    </td>
                    {sessions.map((s) => {
                      const belongs = inSession(s.uuid, student.uuid)
                      const status = cells[cellKey(s.uuid, student.uuid)]?.status ?? null
                      return (
                        <td key={s.uuid} className="border-b border-border p-1 text-center">
                          <AttendanceStatusCell
                            value={status}
                            disabled={!belongs}
                            onChange={(next) => setCellStatus(s.uuid, student.uuid, next)}
                            title={
                              belongs
                                ? `${student.name} — clique para alternar`
                                : `${student.name} não está em ${targetOf(s)}, que é a turma dessa data`
                            }
                            className="mx-auto"
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {successMessage && (
          <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success-foreground">
            {successMessage}
          </p>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={submitting || loading || !sessions?.length}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <ClipboardCheck className="h-4 w-4" />
            Salvar Chamada
          </Button>
        </div>
      </ContentCard>
    </div>
  )
}
