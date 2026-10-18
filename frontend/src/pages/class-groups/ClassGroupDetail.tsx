import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import {
  ArrowLeft, CalendarSync, Check, ClipboardCheck, Clock, Loader2, Pencil, Search,
  Trash2, TriangleAlert, UserPlus, X,
} from "lucide-react"

import useFetch from "@/hooks/useFetch"
import api from "@/services/api"
import { SectionTitle } from "@/components/features/section-title"
import { EntityCard } from "@/components/features/entity-card"
import { StatusBadge } from "@/components/features/status-badge"
import { ScheduleSeriesForm } from "@/components/features/schedule-series-form"
import { EmptyState } from "@/components/common/empty-state"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ContentCard } from "@/components/layout/content-card"
import { describeWeekdays, weekdaysOfDates } from "@/shared/utils/recurrence"
import { sortedByName } from "@/shared/utils/sort-by-name"
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO"
import type { ClassGroupDTO } from "@/shared/dtos/class-group/ClassGroupDTO"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"
import type { AddStudentsToClassGroupDTO } from "@/shared/dtos/class-group/AddStudentsToClassGroupDTO"
import type { ClassGroupUpdateDTO } from "@/shared/dtos/class-group/ClassGroupUpdateDTO"

const pad = (n: number) => String(n).padStart(2, "0")
const startOf = (s: ClassSessionDTO) => new Date(s.startTime as unknown as string)
const fmtDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

interface ScheduleBlock {
  key: string
  recurrenceUuid: string | null
  sessions: ClassSessionDTO[]
}

export default function ClassGroupDetail() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const [classGroup, setClassGroup] = useState<ClassGroupDTO | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  useEffect(() => {
    if (!uuid) return
    api.get<ClassGroupDTO>(`/class/${uuid}`, { data: {} }).then((res) => setClassGroup(res.data))
  }, [uuid, refreshKey])

  const [warning, setWarning] = useState<string | null>(
    (location.state as { warning?: string } | null)?.warning ?? null
  )

  const { data: students } = useFetch<StudentDTO>("/student")
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [draftName, setDraftName] = useState("")
  const [draftDescription, setDraftDescription] = useState("")
  const [savingInfo, setSavingInfo] = useState(false)

  const startEditing = () => {
    setDraftName(classGroup?.name ?? "")
    setDraftDescription(classGroup?.description ?? "")
    setSearch("")
    setError(null)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setSearch("")
    setError(null)
    setIsEditing(false)
  }

  const saveInfo = async () => {
    if (!uuid) return
    if (!draftName.trim()) {
      setError("O nome da turma não pode ficar vazio.")
      return
    }

    setSavingInfo(true)
    setError(null)
    try {
      const payload: ClassGroupUpdateDTO = {
        name: draftName.trim(),
        description: draftDescription.trim(),
      }
      await api.put(`/class/${uuid}`, payload)
      setRefreshKey((k) => k + 1)
      setIsEditing(false)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { mensagem?: string } } }
      setError(e?.response?.data?.mensagem ?? "Não foi possível salvar os dados da turma.")
    } finally {
      setSavingInfo(false)
    }
  }

  const [sessions, setSessions] = useState<ClassSessionDTO[]>([])
  const [seriesFormOpen, setSeriesFormOpen] = useState(false)
  const [editingSeries, setEditingSeries] = useState<ClassSessionDTO[] | null>(null)

  const loadSessions = useCallback(() => {
    if (!uuid) return
    api
      .get<ClassSessionDTO[]>("/classsession", { data: {} })
      .then((res) => setSessions((res.data ?? []).filter((s) => s.classDTO?.uuid === uuid)))
      .catch(() => setSessions([]))
  }, [uuid])

  useEffect(() => { loadSessions() }, [loadSessions, refreshKey])

  const scheduleBlocks = useMemo<ScheduleBlock[]>(() => {
    const series = new Map<string, ClassSessionDTO[]>()
    const loose: ClassSessionDTO[] = []
    sessions.forEach((s) => {
      if (s.recurrenceGroupUuid) {
        const list = series.get(s.recurrenceGroupUuid) ?? []
        list.push(s)
        series.set(s.recurrenceGroupUuid, list)
      } else loose.push(s)
    })

    const sortByDate = (list: ClassSessionDTO[]) =>
      [...list].sort((a, b) => startOf(a).getTime() - startOf(b).getTime())

    return [
      ...[...series.entries()].map(([id, list]) => ({
        key: `s:${id}`, recurrenceUuid: id, sessions: sortByDate(list),
      })),
      ...loose.map((s) => ({ key: `u:${s.uuid}`, recurrenceUuid: null, sessions: [s] })),
    ].sort((a, b) => startOf(a.sessions[0]).getTime() - startOf(b.sessions[0]).getTime())
  }, [sessions])

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDeleteClassGroup = async () => {
    if (!uuid) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await api.delete(`/class/${uuid}`, { data: {} })
      navigate("/class-groups")
    } catch (err: unknown) {
      const e = err as { response?: { data?: { mensagem?: string } } }
      setDeleteError(e?.response?.data?.mensagem ?? "Não foi possível excluir a turma.")
    } finally {
      setDeleting(false)
    }
  }

  const deleteBlock = async (block: ScheduleBlock) => {
    setError(null)
    const failures: string[] = []
    for (const s of block.sessions) {
      try {
        await api.delete(`/classsession/${s.uuid}`, { data: {} })
      } catch (err: unknown) {
        const e = err as { response?: { data?: { mensagem?: string } } }
        failures.push(`${fmtDate(startOf(s))}: ${e?.response?.data?.mensagem ?? "falhou"}`)
      }
    }
    if (failures.length > 0) {
      setError(`Algumas aulas não puderam ser excluídas — ${failures.slice(0, 3).join(" | ")}`)
    }
    setRefreshKey((k) => k + 1)
  }

  const studentByUuid = useMemo(() => {
    const map = new Map<string, StudentDTO>()
    ;(students ?? []).forEach((s) => map.set(s.uuid, s))
    return map
  }, [students])

  const enrolledUuids = new Set((classGroup?.students ?? []).map((s) => s.uuid))
  const enrolledStudents = sortedByName(classGroup?.students ?? [])
  const selectableStudents = sortedByName(
    (students ?? [])
      .filter((s) => !enrolledUuids.has(s.uuid))
      .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAdd = async (studentUuid: string) => {
    if (!uuid) return
    setError(null)
    try {
      const payload: AddStudentsToClassGroupDTO = { studentUuids: [studentUuid] }
      await api.post(`/class/${uuid}/students`, payload)
      setSearch("")
      setRefreshKey((k) => k + 1)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { mensagem?: string } } }
      setError(e?.response?.data?.mensagem ?? "Erro ao matricular aluno.")
    }
  }

  const handleRemove = async (studentUuid: string) => {
    if (!uuid) return
    setError(null)
    try {
      await api.delete(`/class/${uuid}/students/${studentUuid}`, { data: {} })
      setRefreshKey((k) => k + 1)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { mensagem?: string } } }
      setError(e?.response?.data?.mensagem ?? "Erro ao remover aluno.")
    }
  }

  return (
    <div className="animate-in fade-in space-y-6 p-6 duration-500 md:p-8">
      {warning && (
        <div className="flex items-start gap-2.5 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1">{warning}</p>
          <button
            type="button"
            onClick={() => setWarning(null)}
            className="rounded-full p-0.5 text-warning-foreground/70 transition-colors hover:text-warning-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 md:min-h-[3.25rem] md:flex-row md:items-start md:justify-between">
        <div className="w-full md:max-w-xl">
          {isEditing ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                value={draftName}
                maxLength={25}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Nome da turma"
              />
              <Input
                value={draftDescription}
                maxLength={50}
                onChange={(e) => setDraftDescription(e.target.value)}
                placeholder="Descrição (opcional)"
              />
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-foreground">
                {classGroup?.name ?? "Turma"}
              </h2>
              {classGroup?.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{classGroup.description}</p>
              ) : null}
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                title="Excluir turma"
                className="mr-2 text-destructive hover:text-destructive"
                disabled={savingInfo}
                onClick={() => { setDeleteError(null); setConfirmDeleteOpen(true) }}
              >
                <Trash2 className="h-4 w-4" />
                Excluir turma
              </Button>
              <Button variant="outline" onClick={cancelEditing} disabled={savingInfo}>
                Cancelar
              </Button>
              <Button onClick={saveInfo} disabled={savingInfo}>
                {savingInfo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Concluir
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate("/class-groups")}>
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button variant="outline" title="Editar turma" onClick={startEditing}>
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            </>
          )}
        </div>
      </div>

      <ContentCard className="space-y-4">
        <SectionTitle
          title="Alunos Matriculados"
          description={isEditing ? "Adicione ou remova alunos da turma." : undefined}
          className="mb-5 md:items-center"
        />

        {isEditing && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno para adicionar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
            {search && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-md">
                {selectableStudents.length === 0 ? (
                  <p className="px-3 py-3 text-center text-sm text-muted-foreground">
                    Nenhum aluno encontrado
                  </p>
                ) : (
                  selectableStudents.map((st) => (
                    <button
                      key={st.uuid}
                      type="button"
                      onClick={() => handleAdd(st.uuid)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50"
                    >
                      <UserPlus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {st.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {!classGroup || classGroup.students.length === 0 ? (
          <EmptyState
            title="Nenhum aluno matriculado"
            description={
              isEditing
                ? "Use a busca acima para adicionar alunos a essa turma."
                : 'Clique em "Editar" para matricular alunos.'
            }
          />
        ) : (
          <div className="grid max-h-[17rem] grid-cols-1 gap-3 overflow-y-auto pr-1 scrollbar-slim sm:grid-cols-2 xl:grid-cols-3">
            {enrolledStudents.map((student) => (
              <EntityCard
                key={student.uuid}
                name={student.name}
                subtitle={studentByUuid.get(student.uuid)?.email}
                onRemove={isEditing ? () => handleRemove(student.uuid) : undefined}
              />
            ))}
          </div>
        )}
      </ContentCard>

      <ContentCard className="space-y-4">
        <SectionTitle
          title="Aulas Agendadas"
          className="mb-5"
        />

        {scheduleBlocks.length === 0 ? (
          <EmptyState
            title="Nenhuma aula agendada"
            description="Crie um agendamento para esta turma em Agenda → Agendamentos."
          />
        ) : (
          <div className="space-y-2">
            {scheduleBlocks.map((block) => {
              const first = block.sessions[0]
              const last = block.sessions[block.sessions.length - 1]
              const isSeries = Boolean(block.recurrenceUuid)
              const pattern = isSeries
                ? describeWeekdays(weekdaysOfDates(block.sessions.map(startOf)))
                : ""

              return (
                <div
                  key={block.key}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-panel-soft p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {isSeries
                        ? <CalendarSync className="h-4.5 w-4.5 text-primary" />
                        : <Clock className="h-4.5 w-4.5 text-primary" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {first.subjectTeacher.subject.description}
                        </p>
                        {isSeries && (
                          <StatusBadge variant="info">{block.sessions.length} aulas</StatusBadge>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {isSeries
                          ? `${pattern} · ${fmtTime(startOf(first))}–${fmtTime(new Date(first.endTime as unknown as string))} · ${fmtDate(startOf(first))} a ${fmtDate(startOf(last))}`
                          : `${fmtDate(startOf(first))} · ${fmtTime(startOf(first))}–${fmtTime(new Date(first.endTime as unknown as string))}`}
                        {` · Prof. ${first.subjectTeacher.employee.name}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      title={isSeries ? "Fazer chamada de todas as datas" : "Fazer chamada desta aula"}
                      onClick={() =>
                        navigate(
                          isSeries
                            ? `/attendance/series/${block.recurrenceUuid}`
                            : `/attendance/${first.uuid}`
                        )
                      }
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      Chamada
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      title={isSeries ? "Editar recorrência" : "Editar aula"}
                      onClick={() => { setEditingSeries(block.sessions); setSeriesFormOpen(true) }}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      title={isSeries ? "Excluir recorrência inteira" : "Excluir aula"}
                      onClick={() => deleteBlock(block)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ContentCard>

      <ScheduleSeriesForm
        open={seriesFormOpen}
        onClose={() => setSeriesFormOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
        sessions={editingSeries}
      />

      <Dialog open={confirmDeleteOpen} onOpenChange={(o) => !o && setConfirmDeleteOpen(false)}>
        <DialogContent className="p-0">
          <DialogHeader className="border-b border-border p-5 pr-12">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <TriangleAlert className="h-4 w-4 text-destructive" />
              </div>
              <DialogTitle>Excluir turma</DialogTitle>
            </div>
            <DialogDescription className="mt-1">
              A turma <strong>{classGroup?.name}</strong> será excluída. Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 p-5 text-sm">
            <p className="text-muted-foreground">
              {classGroup?.students.length
                ? `${classGroup.students.length} aluno(s) deixarão de estar matriculados nela. Os alunos em si não são excluídos.`
                : "Essa turma não tem alunos matriculados."}
            </p>
            {sessions.length > 0 && (
              <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-warning-foreground">
                Essa turma tem {sessions.length} aula(s) agendada(s). Exclua os agendamentos dela
                primeiro — eles guardam as chamadas já feitas.
              </p>
            )}
            {deleteError && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
                {deleteError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="flex-1"
              type="button"
              disabled={deleting}
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-destructive text-white hover:bg-destructive/90"
              type="button"
              disabled={deleting || sessions.length > 0}
              onClick={handleDeleteClassGroup}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir turma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
