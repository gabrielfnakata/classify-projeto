import { useEffect, useMemo, useState } from "react"
import { CalendarPlus, Loader2, Pencil, X } from "lucide-react"
import { Formik, Form } from "formik"
import type { FormikHelpers } from "formik"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WeekdayPicker } from "@/components/features/weekday-picker"
import { RecurrencePreview } from "@/components/features/recurrence-preview"
import api from "@/services/api"
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO"
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO"
import type { ClassGroupDTO } from "@/shared/dtos/class-group/ClassGroupDTO"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"
import type { ClassSessionCreateDTO } from "@/shared/dtos/class-session/ClassSessionCreateDTO"
import type { ClassSessionUpdateDTO } from "@/shared/dtos/class-session/ClassSessionUpdateDTO"
import type { SubjectTeacherDTO } from "@/shared/dtos/teacher/SubjectTeacherDTO"
import useFetch from "@/hooks/useFetch"
import {
  type ScheduleFormState,
  type ScheduleTargetType,
  EMPTY_SCHEDULE_FORM,
} from "@/shared/models/forms/ScheduleFormState"
import { DEFAULT_REPORT_CONTENT, generateRecurringDates } from "@/shared/utils/recurrence"
import { formatYMD } from "@/shared/utils/date-formatter"
import { sortedByName } from "@/shared/utils/sort-by-name"
import { ScheduleFormSchema } from "@/validation/ScheduleSchema"

const pad = (n: number) => String(n).padStart(2, "0")
function toHHMM(raw: unknown): string {
  const d = new Date(raw as string)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface ScheduleFormProps {
  open: boolean
  onClose: () => void
  onSuccess: (date: string) => void
  editingSessions?: ClassSessionDTO[] | null
}

export function ScheduleForm({ open, onClose, onSuccess, editingSessions }: ScheduleFormProps) {
  const [error, setError] = useState<string | null>(null)

  const { data: subjectTeachersData, loading: loadingST } = useFetch<SubjectTeacherDTO>("/subjectteacher")
  const { data: classroomsData, loading: loadingCR } = useFetch<ClassroomDTO>("/classroom")
  const { data: studentsData, loading: loadingStu } = useFetch<StudentDTO>("/student")
  const { data: classGroupsData, loading: loadingCG } = useFetch<ClassGroupDTO>("/class")

  const subjectTeachers = subjectTeachersData ?? []
  const classrooms = (classroomsData ?? []).filter((c) => !c.isDisabled)
  const students = studentsData ?? []
  const classGroups = classGroupsData ?? []
  const loading = loadingST !== false || loadingCR !== false || loadingStu !== false || loadingCG !== false
  const isEditing = Boolean(editingSessions?.length)
  const editingPrimary = editingSessions?.[0] ?? null
  const originalTargetType: ScheduleTargetType = editingPrimary?.student ? "student" : "class"

  useEffect(() => {
    if (!open) return
    setError(null)
  }, [open])

  const initialValues: ScheduleFormState = useMemo(
    () =>
      editingPrimary && open
        ? {
            date: formatYMD(new Date(editingPrimary.startTime as unknown as string)),
            startTime: toHHMM(editingPrimary.startTime),
            endTime: toHHMM(editingPrimary.endTime),
            teacherId: editingPrimary.subjectTeacher.employee.uuid,
            subjectId: editingPrimary.subjectTeacher.subject.uuid,
            classroomId: editingPrimary.classroomUuid,
            targetType: editingPrimary.student ? "student" : "class",
            studentIds: (editingSessions ?? [])
              .map((s) => s.student?.uuid)
              .filter((uuid): uuid is string => Boolean(uuid)),
            classGroupId: editingPrimary.classDTO?.uuid ?? "",
            isRecurring: false,
            recurringWeekdays: [],
            recurringUntil: "",
          }
        : EMPTY_SCHEDULE_FORM,
    [editingSessions, editingPrimary, open]
  )

  const handleSubmit = async (values: ScheduleFormState, helpers: FormikHelpers<ScheduleFormState>) => {
    setError(null)
    try {
      const subjectTeacherId =
        subjectTeachers.find(
          (st) => st.employee.uuid === values.teacherId && st.subject.uuid === values.subjectId
        )?.uuid ?? ""

      if (!subjectTeacherId) {
        setError("Esse professor não leciona a disciplina selecionada. Escolha outra combinação.")
        helpers.setSubmitting(false)
        return
      }

      if (isEditing && editingSessions && editingSessions.length > 0) {
        const sharedPayload: ClassSessionUpdateDTO = {
          startTime: `${values.date}T${values.startTime}:00`,
          endTime: `${values.date}T${values.endTime}:00`,
          subjectTeacherId,
          classroomUuid: values.classroomId,
        }

        if (values.targetType !== originalTargetType) {
          const [head, ...tail] = editingSessions

          if (values.targetType === "class") {
            for (const s of tail) {
              await api.delete(`/classsession/${s.uuid}`, { data: {} })
            }
            await api.put(`/classsession/${head.uuid}`, { ...sharedPayload, classUuid: values.classGroupId })
          } else {
            const [firstStudent, ...others] = values.studentIds
            await api.put(`/classsession/${head.uuid}`, { ...sharedPayload, studentUuid: firstStudent })
            for (const studentUuid of others) {
              const payload: ClassSessionCreateDTO = {
                subjectTeacherUuid: subjectTeacherId,
                classroomUuid: values.classroomId,
                startTime: sharedPayload.startTime as string,
                endTime: sharedPayload.endTime as string,
                report: { content: DEFAULT_REPORT_CONTENT },
                studentUuid,
                recurrenceGroupUuid: head.recurrenceGroupUuid ?? undefined,
              }
              await api.post("/classsession", payload)
            }
          }
        } else if (values.targetType === "class") {
          await api.put(`/classsession/${editingSessions[0].uuid}`, {
            ...sharedPayload,
            classUuid: values.classGroupId,
          })
        } else {
          const originalByStudent = new Map(
            editingSessions.filter((s) => s.student).map((s) => [s.student!.uuid, s])
          )
          const toRemove = [...originalByStudent.keys()].filter((uuid) => !values.studentIds.includes(uuid))
          const toKeep = values.studentIds.filter((uuid) => originalByStudent.has(uuid))
          const toAdd = values.studentIds.filter((uuid) => !originalByStudent.has(uuid))
          const totalOps = toKeep.length + toAdd.length + toRemove.length

          let done = 0
          try {
            for (const uuid of toKeep) {
              await api.put(`/classsession/${originalByStudent.get(uuid)!.uuid}`, {
                ...sharedPayload,
                studentUuid: uuid,
              })
              done += 1
            }
            for (const uuid of toAdd) {
              const payload: ClassSessionCreateDTO = {
                subjectTeacherUuid: subjectTeacherId,
                classroomUuid: values.classroomId,
                startTime: sharedPayload.startTime as string,
                endTime: sharedPayload.endTime as string,
                report: { content: DEFAULT_REPORT_CONTENT },
                studentUuid: uuid,
                recurrenceGroupUuid: editingPrimary?.recurrenceGroupUuid ?? undefined,
              }
              await api.post("/classsession", payload)
              done += 1
            }
            for (const uuid of toRemove) {
              await api.delete(`/classsession/${originalByStudent.get(uuid)!.uuid}`, { data: {} })
              done += 1
            }
          } catch (err: unknown) {
            const e = err as { response?: { data?: { mensagem?: string } } }
            const message = e?.response?.data?.mensagem ?? "Erro ao atualizar o agendamento."
            throw new Error(
              totalOps > 1
                ? `${done} de ${totalOps} alterações aplicadas. Uma falhou: ${message}`
                : message
            )
          }
        }
      } else {
        const dates = values.isRecurring
          ? generateRecurringDates(values.date, values.recurringUntil, values.recurringWeekdays)
          : [values.date]

        if (dates.length === 0) {
          setError("Nenhuma data corresponde aos dias da semana selecionados nesse período.")
          helpers.setSubmitting(false)
          return
        }

        const studentTargets = values.targetType === "student" ? values.studentIds : [null]
        const combos = dates.flatMap((date) => studentTargets.map((studentUuid) => ({ date, studentUuid })))

        const recurrenceGroupUuid = values.isRecurring && dates.length > 1 ? crypto.randomUUID() : undefined

        let created = 0
        const failures: { date: string; message: string }[] = []

        for (const combo of combos) {
          const payload: ClassSessionCreateDTO = {
            subjectTeacherUuid: subjectTeacherId,
            classroomUuid: values.classroomId,
            startTime: `${combo.date}T${values.startTime}:00`,
            endTime: `${combo.date}T${values.endTime}:00`,
            report: { content: DEFAULT_REPORT_CONTENT },
            recurrenceGroupUuid,
          }
          if (values.targetType === "student") payload.studentUuid = combo.studentUuid as string
          else payload.classUuid = values.classGroupId

          try {
            await api.post("/classsession", payload)
            created += 1
          } catch (err: unknown) {
            const e = err as { response?: { data?: { mensagem?: string } } }
            failures.push({
              date: combo.date,
              message: e?.response?.data?.mensagem ?? "erro desconhecido",
            })
          }
        }

        if (created === 0) {
          throw new Error(failures[0]?.message ?? "Erro ao salvar agendamento.")
        }

        if (failures.length > 0) {
          const dias = [...new Set(failures.map((f) => f.date.split("-").reverse().join("/")))]
          setError(
            `${created} de ${combos.length} aulas criadas. ` +
            `Não foi possível agendar em: ${dias.slice(0, 5).join(", ")}` +
            `${dias.length > 5 ? ` e mais ${dias.length - 5}` : ""}. Motivo: ${failures[0].message}`
          )
          onSuccess(values.date)
          helpers.setSubmitting(false)
          return
        }
      }
      onSuccess(values.date)
      onClose()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { mensagem?: string } }; message?: string }
      setError(e?.response?.data?.mensagem ?? e?.message ?? "Erro ao salvar agendamento.")
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-xl flex-col p-0">
        <Formik
          initialValues={initialValues}
          validationSchema={ScheduleFormSchema()}
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

            const availableStudents = sortedByName(students.filter((st) => !values.studentIds.includes(st.uuid)))

            return (
              <Form className="flex flex-1 flex-col overflow-hidden">
                <DialogHeader className="border-b border-border p-5 pr-12">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {isEditing
                        ? <Pencil className="h-4 w-4 text-primary" />
                        : <CalendarPlus className="h-4 w-4 text-primary" />
                      }
                    </div>
                    <DialogTitle>{isEditing ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
                  </div>
                </DialogHeader>

                {loading ? (
                  <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col gap-4 overflow-y-auto scrollbar-slim p-5">
                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Data e Horário
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Data</Label>
                          <Input
                            type="date"
                            value={values.date}
                            onChange={(e) => setFieldValue("date", e.target.value)}
                          />
                        </div>
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
                    </div>

                    {!isEditing && (
                      <div className={values.isRecurring ? "space-y-2 rounded-lg border border-border p-3" : "space-y-2"}>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="isRecurring"
                            className="border-muted-foreground/50 bg-card"
                            checked={values.isRecurring}
                            onCheckedChange={(checked) => setFieldValue("isRecurring", checked === true)}
                          />
                          <Label htmlFor="isRecurring" className="text-sm font-medium text-foreground">
                            Repetir aula
                          </Label>
                        </div>

                        {values.isRecurring && (
                          <div className="space-y-3 pt-1">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Dias da semana</Label>
                              <WeekdayPicker
                                value={values.recurringWeekdays}
                                onChange={(v) => setFieldValue("recurringWeekdays", v)}
                                className="flex-wrap"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Repetir até</Label>
                              <Input
                                type="date"
                                min={values.date || undefined}
                                value={values.recurringUntil}
                                onChange={(e) => setFieldValue("recurringUntil", e.target.value)}
                              />
                            </div>
                            <RecurrencePreview
                              date={values.date}
                              until={values.recurringUntil}
                              weekdays={values.recurringWeekdays}
                              perDate={values.targetType === "student" ? Math.max(values.studentIds.length, 1) : 1}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
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
                            <SelectTrigger className="flex-1 min-w-0">
                              <SelectValue placeholder="Selecionar..." />
                            </SelectTrigger>
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
                            <SelectTrigger className="flex-1 min-w-0">
                              <SelectValue placeholder="Selecionar..." />
                            </SelectTrigger>
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

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Para quem é a aula?
                        </Label>
                        <div className="inline-flex rounded-lg border border-border bg-panel-strong p-1 shadow-sm">
                          {(
                            [
                              { label: "Aluno individual", value: "student" as ScheduleTargetType },
                              { label: "Turma", value: "class" as ScheduleTargetType },
                            ]
                          ).map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setFieldValue("targetType", option.value)}
                              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                                values.targetType === option.value
                                  ? "bg-card text-foreground shadow-sm"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {isEditing && values.targetType !== originalTargetType && (
                      <p className="text-xs text-warning-foreground">
                        {values.targetType === "class"
                          ? "As aulas individuais deste horário serão substituídas por uma aula da turma."
                          : "A aula da turma será substituída por aulas individuais."}
                        {" A chamada já feita para quem sair da lista será descartada."}
                      </p>
                    )}

                    {values.targetType === "student" && (
                      <div className="space-y-2">
                        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Aluno(s)
                          {!isEditing && values.studentIds.length > 1 && (
                            <span className="ml-1.5 normal-case font-normal text-muted-foreground">
                              (uma aula será criada pra cada um)
                            </span>
                          )}
                        </Label>
                        <Select
                          value=""
                          onValueChange={(v) => setFieldValue("studentIds", [...values.studentIds, v])}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Adicionar aluno..." />
                          </SelectTrigger>
                          <SelectContent position="popper" className="max-h-72">
                            {availableStudents.map((st) => (
                              <SelectItem key={st.uuid} value={st.uuid}>{st.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {values.studentIds.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {values.studentIds.map((id) => {
                              const student = students.find((s) => s.uuid === id)
                              return student ? (
                                <span
                                  key={id}
                                  className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                                >
                                  {student.name}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFieldValue("studentIds", values.studentIds.filter((i) => i !== id))
                                    }
                                    className="ml-0.5 rounded-full hover:text-primary/70"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ) : null
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {values.targetType === "class" && (
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
                      </div>
                    )}

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
                    {isEditing ? "Salvar Alterações" : "Criar Agendamento"}
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
