import { useEffect, useState } from "react"
import { Loader2, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import api from "@/services/api"
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO"
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO"
import type { ClassSession } from "@/shared/models/class-session"
import type { SubjectTeacherDTO } from "@/shared/dtos/teacher/SubjectTeacherDTO"
import useFetch from "@/hooks/useFetch"

interface FormState {
  date: string
  startTime: string
  endTime: string
  teacherId: string
  subjectId: string
  classroomId: string
  studentIds: string[]
}

const EMPTY_FORM: FormState = {
  date: "", startTime: "", endTime: "",
  teacherId: "", subjectId: "", classroomId: "", studentIds: [],
}

interface AgendamentosFormProps {
  open: boolean
  onClose: () => void
  onSuccess: (date: string) => void
  editingSession?: ClassSession | null
}

export function AgendamentosForm({ open, onClose, onSuccess, editingSession }: AgendamentosFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
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
    setForm(
      editingSession
        ? {
            date: editingSession.date,
            startTime: editingSession.startTime,
            endTime: editingSession.endTime,
            teacherId: editingSession._employeeUuid ?? "",
            subjectId: editingSession._subjectUuid ?? "",
            classroomId: editingSession._classroomId ?? "",
            studentIds: editingSession._studentIds ?? [],
          }
        : EMPTY_FORM
    )
  }, [open, editingSession])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const subjectTeacherId =
        subjectTeachers.find(
          (st) => st.employee.uuid === form.teacherId && st.subject.uuid === form.subjectId
        )?.uuid ?? ""

      if (isEditing && editingSession) {
        const payload: Record<string, unknown> = {
          startTime: `${form.date}T${form.startTime}:00`,
          endTime: `${form.date}T${form.endTime}:00`,
        }
        if (subjectTeacherId) payload.subjectTeacherId = subjectTeacherId
        if (form.classroomId) payload.classRoomId = form.classroomId
        await api.put(`/classsession/${editingSession.id}`, payload)
      } else {
        await api.post("/classsession", {
          subjectTeacherId,
          classroomId: form.classroomId,
          startTime: `${form.date}T${form.startTime}:00`,
          endTime: `${form.date}T${form.endTime}:00`,
          studentIds: form.studentIds,
        })
      }
      onSuccess(form.date)
      onClose()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message ?? "Erro ao salvar agendamento.")
    } finally {
      setSubmitting(false)
    }
  }

  const availableTeachers = subjectTeachers
    .filter((st) => !form.subjectId || st.subject.uuid === form.subjectId)
    .reduce<{ uuid: string; name: string }[]>((acc, st) => {
      if (!acc.find((t) => t.uuid === st.employee.uuid)) acc.push(st.employee)
      return acc
    }, [])

  const availableSubjects = subjectTeachers
    .filter((st) => !form.teacherId || st.employee.uuid === form.teacherId)
    .map((st) => st.subject)
    .filter((s, i, arr) => arr.findIndex((x) => x.uuid === s.uuid) === i)

  const filteredStudents = students.filter((st) =>
    st.name.toLowerCase().includes(studentSearch.toLowerCase())
  )

  const isValid = isEditing
    ? Boolean(form.date && form.startTime && form.endTime)
    : Boolean(form.date && form.startTime && form.endTime && form.teacherId && form.subjectId && form.classroomId && form.studentIds.length > 0)

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle>{isEditing ? "Editar Agendamento" : "Novo Agendamento"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Atualize os dados do agendamento." : "Preencha os dados para criar um novo agendamento."}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-foreground">Data e Horário</legend>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Data</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Início</Label>
                  <Input type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Fim</Label>
                  <Input type="time" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} />
                </div>
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Professor</Label>
              <div className="flex gap-2">
                <Select
                  value={form.teacherId}
                  onValueChange={(v) => {
                    const subjectStillValid = subjectTeachers.some(
                      (st) => st.employee.uuid === v && st.subject.uuid === form.subjectId
                    )
                    setForm((p) => ({ ...p, teacherId: v, subjectId: subjectStillValid ? p.subjectId : "" }))
                  }}
                >
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Selecionar professor..." /></SelectTrigger>
                  <SelectContent>
                    {availableTeachers.map((t) => <SelectItem key={t.uuid} value={t.uuid}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {form.teacherId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, teacherId: "" }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Disciplina</Label>
              <div className="flex gap-2">
                <Select
                  value={form.subjectId}
                  onValueChange={(v) => {
                    const teacherStillValid = subjectTeachers.some(
                      (st) => st.subject.uuid === v && st.employee.uuid === form.teacherId
                    )
                    setForm((p) => ({ ...p, subjectId: v, teacherId: teacherStillValid ? p.teacherId : "" }))
                  }}
                >
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Selecionar disciplina..." /></SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((s) => <SelectItem key={s.uuid} value={s.uuid}>{s.description}</SelectItem>)}
                  </SelectContent>
                </Select>
                {form.subjectId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, subjectId: "" }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Sala</Label>
              <Select value={form.classroomId} onValueChange={(v) => setForm((p) => ({ ...p, classroomId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar sala..." /></SelectTrigger>
                <SelectContent>
                  {classrooms.map((cr) => <SelectItem key={cr.uuid} value={cr.uuid}>{cr.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Alunos
                  {form.studentIds.length > 0 && (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      ({form.studentIds.length} selecionado{form.studentIds.length > 1 ? "s" : ""})
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
                      {filteredStudents.filter((s) => !form.studentIds.includes(s.uuid)).length === 0 ? (
                        <p className="px-3 py-3 text-center text-sm text-muted-foreground">Nenhum aluno encontrado</p>
                      ) : (
                        filteredStudents
                          .filter((s) => !form.studentIds.includes(s.uuid))
                          .map((st) => (
                            <button
                              key={st.uuid}
                              type="button"
                              onClick={() => {
                                setForm((p) => ({ ...p, studentIds: [...p.studentIds, st.uuid] }))
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

                {form.studentIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.studentIds.map((id) => {
                      const student = students.find((s) => s.uuid === id)
                      return student ? (
                        <span
                          key={id}
                          className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {student.name}
                          <button
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, studentIds: p.studentIds.filter((i) => i !== id) }))}
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

            {isEditing && (
              <p className="text-xs text-muted-foreground">
                {form.studentIds.length} aluno{form.studentIds.length !== 1 ? "s" : ""} vinculado{form.studentIds.length !== 1 ? "s" : ""} a este agendamento.
              </p>
            )}

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 border-t border-border p-4">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={submitting || loading || !isValid}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Salvar Alterações" : "Criar Agendamento"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
