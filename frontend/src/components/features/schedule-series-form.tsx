import { useEffect, useMemo, useState } from "react"
import { CalendarSync, Loader2, X } from "lucide-react"
import { Formik, Form } from "formik"
import type { FormikHelpers } from "formik"
import * as yup from "yup"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/services/api"
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"
import type { ClassSessionUpdateDTO } from "@/shared/dtos/class-session/ClassSessionUpdateDTO"
import type { ClassSessionCreateDTO } from "@/shared/dtos/class-session/ClassSessionCreateDTO"
import type { ClassGroupDTO } from "@/shared/dtos/class-group/ClassGroupDTO"
import type { SubjectTeacherDTO } from "@/shared/dtos/teacher/SubjectTeacherDTO"
import useFetch from "@/hooks/useFetch"
import { formatYMD } from "@/shared/utils/date-formatter"
import { sortedByName } from "@/shared/utils/sort-by-name"
import {
  DEFAULT_REPORT_CONTENT,
  describeWeekdays,
  generateRecurringDates,
  weekdaysOfDates,
} from "@/shared/utils/recurrence"

const pad = (n: number) => String(n).padStart(2, "0")
function toHHMM(raw: unknown): string {
  const d = new Date(raw as string)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface FormValues {
  teacherId: string
  subjectId: string
  classroomId: string
  classGroupId: string
  startTime: string
  endTime: string
  until: string
}

const ScheduleSeriesSchema = yup.object({
  teacherId: yup.string().required("Selecione o professor"),
  subjectId: yup.string().required("Selecione a disciplina"),
  classroomId: yup.string().required("Selecione a sala"),
  startTime: yup.string().required("Informe o horário de início"),
  endTime: yup
    .string()
    .required("Informe o horário de fim")
    .test("after-start", "O fim deve ser depois do início", function (endTime) {
      const { startTime } = this.parent
      if (!startTime || !endTime) return true
      return endTime > startTime
    }),
  until: yup.string().required("Informe até quando a recorrência vai"),
  classGroupId: yup.string(),
})

interface ScheduleSeriesFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  sessions: ClassSessionDTO[] | null
}

export function ScheduleSeriesForm({ open, onClose, onSuccess, sessions }: ScheduleSeriesFormProps) {
  const [error, setError] = useState<string | null>(null)

  const { data: subjectTeachersData, loading: loadingST } = useFetch<SubjectTeacherDTO>("/subjectteacher")
  const { data: classroomsData, loading: loadingCR } = useFetch<ClassroomDTO>("/classroom")
  const { data: classGroupsData, loading: loadingCG } = useFetch<ClassGroupDTO>("/class")

  const subjectTeachers = subjectTeachersData ?? []
  const classrooms = (classroomsData ?? []).filter((c) => !c.isDisabled)
  const classGroups = classGroupsData ?? []
  const loading = loadingST !== false || loadingCR !== false || loadingCG !== false

  const primary = sessions?.[0] ?? null
  const isClassSeries = Boolean(primary?.classDTO)

  const occurrenceCount = useMemo(() => {
    if (!sessions) return 0
    return new Set(sessions.map((s) => formatYMD(new Date(s.startTime as unknown as string)))).size
  }, [sessions])

  useEffect(() => {
    if (!open) return
    setError(null)
  }, [open])

  const lastDate = useMemo(() => {
    if (!sessions || sessions.length === 0) return ""
    return sessions
      .map((s) => formatYMD(new Date(s.startTime as unknown as string)))
      .sort()
      .slice(-1)[0]
  }, [sessions])

  const seriesWeekdays = useMemo(
    () => weekdaysOfDates((sessions ?? []).map((s) => new Date(s.startTime as unknown as string))),
    [sessions]
  )

  const initialValues: FormValues = useMemo(
    () =>
      primary && open
        ? {
            teacherId: primary.subjectTeacher.employee.uuid,
            subjectId: primary.subjectTeacher.subject.uuid,
            classroomId: primary.classroomUuid,
            classGroupId: primary.classDTO?.uuid ?? "",
            startTime: toHHMM(primary.startTime),
            endTime: toHHMM(primary.endTime),
            until: lastDate,
          }
        : { teacherId: "", subjectId: "", classroomId: "", classGroupId: "", startTime: "", endTime: "", until: "" },
    [primary, open, lastDate]
  )

  const handleSubmit = async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    setError(null)
    try {
      if (!sessions || sessions.length === 0) return

      const subjectTeacherId =
        subjectTeachers.find(
          (st) => st.employee.uuid === values.teacherId && st.subject.uuid === values.subjectId
        )?.uuid ?? ""

      if (!subjectTeacherId) {
        setError("Esse professor não leciona a disciplina selecionada. Escolha outra combinação.")
        helpers.setSubmitting(false)
        return
      }

      const dateOf = (s: ClassSessionDTO) => formatYMD(new Date(s.startTime as unknown as string))
      const keep = sessions.filter((s) => dateOf(s) <= values.until)
      const drop = sessions.filter((s) => dateOf(s) > values.until)
      const problems: string[] = []

      let updated = 0
      for (const session of keep) {
        const date = dateOf(session)
        const payload: ClassSessionUpdateDTO = {
          subjectTeacherId,
          classroomUuid: values.classroomId,
          startTime: `${date}T${values.startTime}:00`,
          endTime: `${date}T${values.endTime}:00`,
        }
        if (isClassSeries) payload.classUuid = values.classGroupId
        else if (session.student) payload.studentUuid = session.student.uuid

        try {
          await api.put(`/classsession/${session.uuid}`, payload)
          updated += 1
        } catch (err: unknown) {
          const e = err as { response?: { data?: { mensagem?: string } } }
          problems.push(`${date.split("-").reverse().join("/")}: ${e?.response?.data?.mensagem ?? "falhou"}`)
        }
      }

      let removed = 0
      for (const session of drop) {
        try {
          await api.delete(`/classsession/${session.uuid}`, { data: {} })
          removed += 1
        } catch (err: unknown) {
          const e = err as { response?: { data?: { mensagem?: string } } }
          problems.push(`${dateOf(session).split("-").reverse().join("/")}: ${e?.response?.data?.mensagem ?? "não pôde ser removida"}`)
        }
      }

      let addedCount = 0
      if (lastDate && values.until > lastDate) {
        const weekdays = weekdaysOfDates(sessions.map((s) => new Date(s.startTime as unknown as string)))
        const existing = new Set(sessions.map(dateOf))
        const targets = generateRecurringDates(lastDate, values.until, weekdays).filter((d) => !existing.has(d))

        const perDate = isClassSeries
          ? [null]
          : [...new Set(sessions.filter((s) => s.student).map((s) => s.student!.uuid))]

        for (const date of targets) {
          for (const studentUuid of perDate) {
            const payload: ClassSessionCreateDTO = {
              subjectTeacherUuid: subjectTeacherId,
              classroomUuid: values.classroomId,
              startTime: `${date}T${values.startTime}:00`,
              endTime: `${date}T${values.endTime}:00`,
              report: { content: DEFAULT_REPORT_CONTENT },
              recurrenceGroupUuid: primary?.recurrenceGroupUuid ?? undefined,
            }
            if (studentUuid) payload.studentUuid = studentUuid
            else payload.classUuid = values.classGroupId

            try {
              await api.post("/classsession", payload)
              addedCount += 1
            } catch (err: unknown) {
              const e = err as { response?: { data?: { mensagem?: string } } }
              problems.push(`${date.split("-").reverse().join("/")}: ${e?.response?.data?.mensagem ?? "falhou"}`)
            }
          }
        }
      }

      if (problems.length > 0) {
        setError(
          `${updated} atualizada(s), ${removed} removida(s), ${addedCount} criada(s). ` +
          `Pendências — ${problems.slice(0, 4).join(" | ")}` +
          `${problems.length > 4 ? ` e mais ${problems.length - 4}` : ""}`
        )
        onSuccess()
        helpers.setSubmitting(false)
        return
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { mensagem?: string } }; message?: string }
      setError(e?.response?.data?.mensagem ?? e?.message ?? "Erro ao atualizar a recorrência.")
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0">
        <Formik
          initialValues={initialValues}
          validationSchema={ScheduleSeriesSchema}
          onSubmit={handleSubmit}
          validateOnMount={true}
          enableReinitialize={true}
        >
          {({ isSubmitting, isValid, values, setFieldValue }) => {
            const availableTeachers = [
              ...new Map(
                subjectTeachers
                  .filter((st) => !values.subjectId || st.subject.uuid === values.subjectId)
                  .map((st) => [st.employee.uuid, st.employee])
              ).values(),
            ]

            const availableSubjects = [
              ...new Map(
                subjectTeachers
                  .filter((st) => !values.teacherId || st.employee.uuid === values.teacherId)
                  .map((st) => [st.subject.uuid, st.subject])
              ).values(),
            ]

            return (
              <Form>
                <DialogHeader className="border-b border-border p-5 pr-12">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <CalendarSync className="h-4 w-4 text-primary" />
                    </div>
                    <DialogTitle>Editar Recorrência</DialogTitle>
                  </div>
                  <DialogDescription className="sr-only">
                    {sessions
                      ? `Altera ${occurrenceCount} aula${occurrenceCount > 1 ? "s" : ""} desta recorrência, desta data em diante.`
                      : ""}
                  </DialogDescription>
                </DialogHeader>

                {loading ? (
                  <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 p-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Início</Label>
                        <Input
                          type="time"
                          value={values.startTime}
                          onChange={(e) => setFieldValue("startTime", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Fim</Label>
                        <Input
                          type="time"
                          value={values.endTime}
                          onChange={(e) => setFieldValue("endTime", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Repetir até</Label>
                      <Input
                        type="date"
                        value={values.until}
                        onChange={(e) => setFieldValue("until", e.target.value)}
                      />
                      {values.until && lastDate && values.until < lastDate && (
                        <p className="text-xs text-destructive">
                          Encurtar a recorrência vai excluir as aulas depois de{" "}
                          {values.until.split("-").reverse().join("/")}.
                        </p>
                      )}
                      {values.until && lastDate && values.until > lastDate && (
                        <p className="text-xs text-muted-foreground">
                          Novas aulas serão criadas {describeWeekdays(seriesWeekdays)} até{" "}
                          {values.until.split("-").reverse().join("/")}.
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Professor
                        </Label>
                        <div className="flex gap-1.5">
                          <Select
                            value={values.teacherId}
                            onValueChange={(v) => {
                              const subjectStillValid = subjectTeachers.some(
                                (st) => st.employee.uuid === v && st.subject.uuid === values.subjectId
                              )
                              setFieldValue("teacherId", v)
                              if (!subjectStillValid) setFieldValue("subjectId", "")
                            }}
                          >
                            <SelectTrigger className="flex-1 min-w-0"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                            <SelectContent position="popper" className="max-h-72">
                              {availableTeachers.map((t) => (
                                <SelectItem key={t.uuid} value={t.uuid}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {values.teacherId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              title="Limpar professor"
                              className="shrink-0"
                              onClick={() => setFieldValue("teacherId", "")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Disciplina
                        </Label>
                        <div className="flex gap-1.5">
                          <Select
                            value={values.subjectId}
                            onValueChange={(v) => {
                              const teacherStillValid = subjectTeachers.some(
                                (st) => st.subject.uuid === v && st.employee.uuid === values.teacherId
                              )
                              setFieldValue("subjectId", v)
                              if (!teacherStillValid) setFieldValue("teacherId", "")
                            }}
                          >
                            <SelectTrigger className="flex-1 min-w-0"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                            <SelectContent position="popper" className="max-h-72">
                              {availableSubjects.map((s) => (
                                <SelectItem key={s.uuid} value={s.uuid}>{s.description}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {values.subjectId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              title="Limpar disciplina"
                              className="shrink-0"
                              onClick={() => setFieldValue("subjectId", "")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Sala
                        </Label>
                        <Select
                          value={values.classroomId}
                          onValueChange={(v) => setFieldValue("classroomId", v)}
                        >
                          <SelectTrigger className="w-full"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                          <SelectContent position="popper" className="max-h-72">
                            {classrooms.map((cr) => (
                              <SelectItem key={cr.uuid} value={cr.uuid}>{cr.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {isClassSeries && (
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Turma
                          </Label>
                          <Select
                            value={values.classGroupId}
                            onValueChange={(v) => setFieldValue("classGroupId", v)}
                          >
                            <SelectTrigger className="w-full"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                            <SelectContent position="popper" className="max-h-72">
                              {sortedByName(classGroups).map((cg) => (
                                <SelectItem key={cg.uuid} value={cg.uuid}>{cg.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {values.classGroupId !== (primary?.classDTO?.uuid ?? "") && (
                            <p className="text-xs text-warning-foreground">
                              Todas as aulas desta recorrência passarão para a nova turma. A chamada
                              já feita para quem não estiver nela será descartada.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {error && (
                      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                      </p>
                    )}
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" className="flex-1" type="button" onClick={onClose} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    type="submit"
                    disabled={isSubmitting || loading || !isValid}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Salvar Recorrência
                  </Button>
                </DialogFooter>
              </Form>
            )
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
