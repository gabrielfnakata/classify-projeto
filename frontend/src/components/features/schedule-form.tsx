import { useEffect, useMemo, useState } from "react"
import { CalendarPlus, Loader2, Pencil, Search, X } from "lucide-react"
import { Formik, Form } from "formik"
import type { FormikHelpers } from "formik"

import { Button } from "@/components/ui/button"
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
import api from "@/services/api"
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO"
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"
import type { SubjectTeacherDTO } from "@/shared/dtos/teacher/SubjectTeacherDTO"
import useFetch from "@/hooks/useFetch"
import { type ScheduleFormState, EMPTY_SCHEDULE_FORM } from "@/shared/models/forms/ScheduleFormState"
import { formatYMD } from "@/shared/utils/date-formatter"
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
  editingSession?: ClassSessionDTO | null
}

export function ScheduleForm({ open, onClose, onSuccess, editingSession }: ScheduleFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [studentSearch, setStudentSearch] = useState("")

  const { data: subjectTeachersData, loading: loadingST } = useFetch<SubjectTeacherDTO>("/subjectteacher")
  const { data: classroomsData, loading: loadingCR } = useFetch<ClassroomDTO>("/classroom")
  const { data: studentsData, loading: loadingStu } = useFetch<StudentDTO>("/student")

  const subjectTeachers = subjectTeachersData ?? []
  const classrooms = (classroomsData ?? []).filter((c) => !c.isDisabled)
  const students = studentsData ?? []
  const loading = loadingST !== false || loadingCR !== false || loadingStu !== false
  const isEditing = Boolean(editingSession)

  useEffect(() => {
    if (!open) return
    setStudentSearch("")
    setError(null)
  }, [open])

  const initialValues: ScheduleFormState = useMemo(
    () =>
      editingSession && open
        ? {
            date: formatYMD(new Date(editingSession.startTime as unknown as string)),
            startTime: toHHMM(editingSession.startTime),
            endTime: toHHMM(editingSession.endTime),
            teacherId: editingSession.subjectTeacher.uuidEmployee,
            subjectId: editingSession.subjectTeacher.uuidSubject,
            classroomId: editingSession.classroom.uuid,
            studentIds: editingSession.students.map((s) => s.uuid),
          }
        : EMPTY_SCHEDULE_FORM,
    [editingSession, open]
  )

  const handleSubmit = async (values: ScheduleFormState, helpers: FormikHelpers<ScheduleFormState>) => {
    setError(null)
    try {
      const subjectTeacherId =
        subjectTeachers.find(
          (st) => st.employee.uuid === values.teacherId && st.subject.uuid === values.subjectId
        )?.uuid ?? ""

      if (isEditing && editingSession) {
        const payload: Record<string, unknown> = {
          startTime: `${values.date}T${values.startTime}:00`,
          endTime: `${values.date}T${values.endTime}:00`,
        }
        if (subjectTeacherId) payload.subjectTeacherId = subjectTeacherId
        if (values.classroomId) payload.classRoomId = values.classroomId
        await api.put(`/classsession/${editingSession.uuid}`, payload)
      } else {
        await api.post("/classsession", {
          subjectTeacherId,
          classroomId: values.classroomId,
          startTime: `${values.date}T${values.startTime}:00`,
          endTime: `${values.date}T${values.endTime}:00`,
          studentIds: values.studentIds,
        })
      }
      onSuccess(values.date)
      onClose()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message ?? "Erro ao salvar agendamento.")
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-xl flex-col p-0">
        <Formik
          initialValues={initialValues}
          validationSchema={ScheduleFormSchema(isEditing)}
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

            const filteredStudents = students.filter((st) =>
              st.name.toLowerCase().includes(studentSearch.toLowerCase())
            )
            const selectableStudents = filteredStudents.filter(
              (s) => !values.studentIds.includes(s.uuid)
            )

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
                  <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
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
                            <SelectContent>
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
                            <SelectContent>
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
                          <SelectContent>
                            {classrooms.map((cr) => (
                              <SelectItem key={cr.uuid} value={cr.uuid}>{cr.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {!isEditing && (
                      <div className="space-y-2">
                        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Alunos
                          {values.studentIds.length > 0 && (
                            <span className="ml-1.5 normal-case font-normal text-muted-foreground">
                              ({values.studentIds.length} selecionado{values.studentIds.length > 1 ? "s" : ""})
                            </span>
                          )}
                        </Label>

                        <div className="relative">
                          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Buscar aluno para adicionar..."
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            className="pl-8"
                          />
                          {studentSearch && (
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
                                    onClick={() => {
                                      setFieldValue("studentIds", [...values.studentIds, st.uuid])
                                      setStudentSearch("")
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50"
                                  >
                                    {st.name}
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {values.studentIds.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
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
