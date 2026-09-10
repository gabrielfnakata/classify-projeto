import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { ArrowLeft, ClipboardCheck, Loader2 } from "lucide-react"

import api from "@/services/api"
import { SectionTitle } from "@/components/features/section-title"
import { AttendanceStatusToggle } from "@/components/features/attendance-status-toggle"
import { InitialsAvatar } from "@/components/features/initials-avatar"
import { EmptyState } from "@/components/common/empty-state"
import { SelectField } from "@/components/common/select-field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ContentCard } from "@/components/layout/content-card"
import { JUSTIFICATION_REASON_OPTIONS } from "@/lib/justification-reason-options"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"
import type {
  AttendanceRosterEntryDTO,
  AttendanceStatus,
  JustificationReason,
} from "@/shared/dtos/attendance/AttendanceRosterEntryDTO"
import type { AttendanceRecordInputDTO } from "@/shared/dtos/attendance/AttendanceRecordInputDTO"

interface RowEditState {
  status: AttendanceStatus | null
  justificationReason: JustificationReason | null
  justificationNote: string | null
}

interface RosterEntry extends AttendanceRosterEntryDTO {
  sessionUuid: string
}

const pad = (n: number) => String(n).padStart(2, "0")
function toHHMM(raw: unknown): string {
  const d = new Date(raw as string)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDisplayDate(raw: unknown): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(raw as string))
}

export default function AttendancePage() {
  const { sessionUuid } = useParams<{ sessionUuid: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const groupParam = searchParams.get("group") ?? ""
  const groupUuids = useMemo(
    () => (groupParam ? groupParam.split(",").filter(Boolean) : []),
    [groupParam]
  )
  const allSessionUuids = useMemo(
    () => (sessionUuid ? [sessionUuid, ...groupUuids] : []),
    [sessionUuid, groupUuids]
  )

  const [session, setSession] = useState<ClassSessionDTO | null>(null)
  useEffect(() => {
    if (!sessionUuid) return
    api.get<ClassSessionDTO>(`/classsession/${sessionUuid}`, { data: {} }).then((res) => setSession(res.data))
  }, [sessionUuid])

  const [refreshKey, setRefreshKey] = useState(0)
  const [roster, setRoster] = useState<RosterEntry[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionUuid) return
    const uuids = [sessionUuid, ...groupUuids]
    setLoading(true)
    Promise.all(
      uuids.map((uuid) =>
        api
          .get<AttendanceRosterEntryDTO[]>(`/attendance/session/${uuid}`, { data: {} })
          .then((res) => (res.status === 204 ? [] : res.data).map((entry) => ({ ...entry, sessionUuid: uuid })))
      )
    )
      .then((results) => setRoster(results.flat()))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUuid, groupParam, refreshKey])

  const sessionByStudent = useMemo(() => {
    const map = new Map<string, string>()
    ;(roster ?? []).forEach((entry) => map.set(entry.studentUuid, entry.sessionUuid))
    return map
  }, [roster])

  const [edits, setEdits] = useState<Record<string, RowEditState>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!roster) return
    setEdits((prev) => {
      const next = { ...prev }
      roster.forEach((entry) => {
        if (!next[entry.studentUuid]) {
          next[entry.studentUuid] = {
            status: entry.status,
            justificationReason: entry.justificationReason,
            justificationNote: entry.justificationNote,
          }
        }
      })
      return next
    })
  }, [roster])

  const setRowStatus = (studentUuid: string, status: AttendanceStatus | null) => {
    setEdits((prev) => ({
      ...prev,
      [studentUuid]: {
        status,
        justificationReason: status === "AUSENTE" ? (prev[studentUuid]?.justificationReason ?? null) : null,
        justificationNote: status === "AUSENTE" ? (prev[studentUuid]?.justificationNote ?? null) : null,
      },
    }))
  }

  const setRowJustificationReason = (studentUuid: string, justificationReason: string) => {
    setEdits((prev) => ({
      ...prev,
      [studentUuid]: {
        ...prev[studentUuid],
        status: prev[studentUuid]?.status ?? null,
        justificationReason: (justificationReason || null) as JustificationReason | null,
      },
    }))
  }

  const setRowJustificationNote = (studentUuid: string, justificationNote: string) => {
    setEdits((prev) => ({
      ...prev,
      [studentUuid]: {
        ...prev[studentUuid],
        status: prev[studentUuid]?.status ?? null,
        justificationNote: justificationNote || null,
      },
    }))
  }

  const summary = (roster ?? []).reduce(
    (acc, entry) => {
      const status = entry.studentUuid in edits ? edits[entry.studentUuid].status : entry.status
      if (status === "PRESENTE") acc.present += 1
      else if (status === "AUSENTE") acc.absent += 1
      else acc.unmarked += 1
      return acc
    },
    { present: 0, absent: 0, unmarked: 0 }
  )

  const handleSave = async () => {
    if (allSessionUuids.length === 0) return
    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    const recordsBySession = new Map<string, AttendanceRecordInputDTO[]>()
    const toClear: string[] = []

    Object.entries(edits).forEach(([studentUuid, edit]) => {
      const originSession = sessionByStudent.get(studentUuid)
      if (!originSession) return

      if (edit.status === null) {
        const saved = (roster ?? []).find((e) => e.studentUuid === studentUuid)?.attendanceUuid
        if (saved) toClear.push(saved)
        return
      }

      const list = recordsBySession.get(originSession) ?? []
      list.push({
        studentUuid,
        status: edit.status,
        justificationReason: edit.justificationReason,
        justificationNote: edit.justificationNote,
      })
      recordsBySession.set(originSession, list)
    })

    if (recordsBySession.size === 0 && toClear.length === 0) {
      setError("Marque presença ou falta de ao menos um aluno antes de salvar.")
      setSubmitting(false)
      return
    }

    try {
      const results = await Promise.allSettled([
        ...Array.from(recordsBySession.entries()).map(([uuid, records]) =>
          api.put(`/attendance/session/${uuid}`, { records })
        ),
        ...toClear.map((attendanceUuid) =>
          api.delete(`/attendance/${attendanceUuid}`, { data: {} })
        ),
      ])
      const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[]

      if (failed.length > 0) {
        const reason = failed[0].reason as { response?: { data?: { mensagem?: string } } }
        const message = reason?.response?.data?.mensagem ?? "Erro ao salvar a chamada."
        setError(
          results.length > 1
            ? `${results.length - failed.length} de ${results.length} alterações salvas. Uma falhou: ${message}`
            : message
        )
      } else {
        setSuccessMessage("Chamada salva com sucesso.")
      }
      setRefreshKey((k) => k + 1)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-in fade-in space-y-6 p-6 duration-500 md:p-8">
      <SectionTitle
        title="Chamada"
        description={
          session
            ? `${session.subjectTeacher.subject.description} · ${formatDisplayDate(session.startTime)} · ${toHHMM(session.startTime)}–${toHHMM(session.endTime)}`
            : "Carregando aula..."
        }
        action={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        }
      />

      <ContentCard className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            {summary.present} presentes
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            {summary.absent} ausentes
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            {summary.unmarked} sem marcação
          </span>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (roster ?? []).length === 0 ? (
          <EmptyState
            title="Nenhum aluno nessa aula"
            description="Essa aula não tem alunos vinculados pra fazer a chamada."
          />
        ) : (
          <div className="space-y-2">
            {roster!.map((entry) => {
              const edit = edits[entry.studentUuid]
              const isAbsent = edit?.status === "AUSENTE"

              return (
                <div
                  key={entry.studentUuid}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-panel-soft p-4 lg:flex-row lg:items-center lg:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3 lg:w-52 lg:shrink-0">
                    <InitialsAvatar name={entry.studentName} />
                    <span className="truncate font-medium text-foreground">
                      {entry.studentName}
                    </span>
                  </div>

                  <AttendanceStatusToggle
                    value={edit?.status ?? null}
                    onChange={(status) => setRowStatus(entry.studentUuid, status)}
                  />

                  {isAbsent && (
                    <>
                      <SelectField
                        value={edit?.justificationReason ?? ""}
                        onChange={(value) => setRowJustificationReason(entry.studentUuid, value)}
                        options={JUSTIFICATION_REASON_OPTIONS}
                        placeholder="Sem motivo informado"
                        className="lg:w-52"
                      />
                      <Input
                        value={edit?.justificationNote ?? ""}
                        onChange={(e) => setRowJustificationNote(entry.studentUuid, e.target.value)}
                        placeholder="Observação (opcional)"
                        className="lg:w-64"
                      />
                    </>
                  )}
                </div>
              )
            })}
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
          <Button onClick={handleSave} disabled={submitting || loading || (roster ?? []).length === 0}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <ClipboardCheck className="h-4 w-4" />
            Salvar Chamada
          </Button>
        </div>
      </ContentCard>
    </div>
  )
}
