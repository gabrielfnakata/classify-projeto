import { useState } from "react"
import { useNavigate } from "react-router"
import { Formik, Form } from "formik"
import type { FormikHelpers } from "formik"
import { CalendarPlus, Loader2, X } from "lucide-react"

import api from "@/services/api"
import useFetch from "@/hooks/useFetch"
import { FormikInput } from "@/components/formik-input/FormikInput"
import { FormGrid } from "@/components/features/form-grid"
import { WeekdayPicker } from "@/components/features/weekday-picker"
import { RecurrencePreview } from "@/components/features/recurrence-preview"
import { PageHeader } from "@/components/layout/page-header"
import { ContentCard } from "@/components/layout/content-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO"
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO"
import type { SubjectTeacherDTO } from "@/shared/dtos/teacher/SubjectTeacherDTO"
import type { ClassGroupCreateDTO } from "@/shared/dtos/class-group/ClassGroupCreateDTO"
import type { ClassGroupDTO } from "@/shared/dtos/class-group/ClassGroupDTO"
import type { AddStudentsToClassGroupDTO } from "@/shared/dtos/class-group/AddStudentsToClassGroupDTO"
import type { ClassSessionCreateDTO } from "@/shared/dtos/class-session/ClassSessionCreateDTO"
import { DEFAULT_REPORT_CONTENT, generateRecurringDates } from "@/shared/utils/recurrence"
import { sortedByName } from "@/shared/utils/sort-by-name"
import { NewClassGroupValidationSchema } from "@/validation/ClassGroupSchema"

interface FormValues {
    name: string;
    description: string;
    studentIds: string[];
    scheduleEnabled: boolean;
    teacherId: string;
    subjectId: string;
    classroomId: string;
    date: string;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    recurringWeekdays: number[];
    recurringUntil: string;
}

const INITIAL_VALUES: FormValues = {
    name: "",
    description: "",
    studentIds: [],
    scheduleEnabled: false,
    teacherId: "",
    subjectId: "",
    classroomId: "",
    date: "",
    startTime: "",
    endTime: "",
    isRecurring: false,
    recurringWeekdays: [],
    recurringUntil: "",
}

export default function NewClassGroup() {
    const navigate = useNavigate();
    const { data: studentsData } = useFetch<StudentDTO>("/student");
    const { data: subjectTeachersData } = useFetch<SubjectTeacherDTO>("/subjectteacher");
    const { data: classroomsData } = useFetch<ClassroomDTO>("/classroom");
    const students = studentsData ?? [];
    const subjectTeachers = subjectTeachersData ?? [];
    const classrooms = (classroomsData ?? []).filter((c) => !c.isDisabled);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(values: FormValues, helpers: FormikHelpers<FormValues>) {
        setError(null);

        let classUuid: string;
        try {
            const payload: ClassGroupCreateDTO = {
                name: values.name,
                description: values.description || null,
            };
            const response = await api.post<ClassGroupDTO>('/class', payload);
            classUuid = response.data.uuid;
        } catch (err: unknown) {
            const e = err as { response?: { data?: { mensagem?: string } } };
            setError(e?.response?.data?.mensagem ?? "Erro ao criar turma.");
            helpers.setSubmitting(false);
            return;
        }

        let warning: string | null = null;

        if (values.studentIds.length > 0) {
            try {
                const addPayload: AddStudentsToClassGroupDTO = { studentUuids: values.studentIds };
                await api.post(`/class/${classUuid}/students`, addPayload);
            } catch (err: unknown) {
                const e = err as { response?: { data?: { mensagem?: string } } };
                warning = e?.response?.data?.mensagem ?? "Turma criada, mas não foi possível matricular os alunos selecionados.";
            }
        }

        if (values.scheduleEnabled) {
            const subjectTeacherId = subjectTeachers.find(
                (st) => st.employee.uuid === values.teacherId && st.subject.uuid === values.subjectId
            )?.uuid ?? "";

            const dates = values.isRecurring
                ? generateRecurringDates(values.date, values.recurringUntil, values.recurringWeekdays)
                : [values.date];

            if (!subjectTeacherId) {
                warning = "Turma criada, mas as aulas não foram agendadas: esse professor não leciona a disciplina selecionada.";
                navigate(`/class-groups/${classUuid}`, { state: { warning } });
                return;
            }

            if (dates.length === 0) {
                warning = "Turma criada, mas nenhuma aula foi agendada: nenhuma data corresponde aos dias da semana escolhidos nesse período.";
                navigate(`/class-groups/${classUuid}`, { state: { warning } });
                return;
            }

            const recurrenceGroupUuid = values.isRecurring && dates.length > 1 ? crypto.randomUUID() : undefined;

            let created = 0;
            const failures: { date: string; message: string }[] = [];

            for (const date of dates) {
                const sessionPayload: ClassSessionCreateDTO = {
                    subjectTeacherUuid: subjectTeacherId,
                    classroomUuid: values.classroomId,
                    startTime: `${date}T${values.startTime}:00`,
                    endTime: `${date}T${values.endTime}:00`,
                    report: { content: DEFAULT_REPORT_CONTENT },
                    classUuid,
                    recurrenceGroupUuid,
                };
                try {
                    await api.post("/classsession", sessionPayload);
                    created += 1;
                } catch (err: unknown) {
                    const e = err as { response?: { data?: { mensagem?: string } } };
                    failures.push({ date, message: e?.response?.data?.mensagem ?? "erro desconhecido" });
                }
            }

            if (failures.length > 0) {
                const dias = failures.map((f) => f.date.split("-").reverse().join("/"));
                warning = created === 0
                    ? `Turma criada, mas nenhuma aula foi agendada: ${failures[0].message}`
                    : `${created} de ${dates.length} aulas agendadas. Ficaram de fora: ${dias.slice(0, 5).join(", ")}`
                      + `${dias.length > 5 ? ` e mais ${dias.length - 5}` : ""}. Motivo: ${failures[0].message}`;
            }
        }

        navigate(`/class-groups/${classUuid}`, warning ? { state: { warning } } : undefined);
    }

    return (
        <div className="flex flex-col background h-full w-full items-center justify-center">
            <div className="flex flex-col w-full h-full gap-[2vh] justify-center items-center">
                <div className="flex flex-row w-4/5 items-center justify-between">
                    <PageHeader title="Nova Turma" />
                </div>
                <ContentCard className="flex flex-col w-4/5 h-fit-content p-8 gap-[4vh]">
                    <Formik
                        initialValues={INITIAL_VALUES}
                        onSubmit={handleSubmit}
                        validationSchema={NewClassGroupValidationSchema}
                        validateOnMount
                    >
                        {({ isSubmitting, isValid, values, setFieldValue }) => {
                            const availableStudents = sortedByName(students.filter((st) => !values.studentIds.includes(st.uuid)));

                            const availableTeachers = [
                                ...new Map(
                                    subjectTeachers
                                        .filter((st) => !values.subjectId || st.subject.uuid === values.subjectId)
                                        .map((st) => [st.employee.uuid, st.employee])
                                ).values(),
                            ];

                            const availableSubjects = [
                                ...new Map(
                                    subjectTeachers
                                        .filter((st) => !values.teacherId || st.employee.uuid === values.teacherId)
                                        .map((st) => [st.subject.uuid, st.subject])
                                ).values(),
                            ];

                            return (
                                <Form className="flex flex-col gap-[3vh]">
                                    <FormGrid>
                                        <FormikInput name="name" label="Nome" type="text" required />
                                        <FormikInput name="description" label="Descrição" type="text" />
                                    </FormGrid>

                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Alunos
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
                                                    const student = students.find((s) => s.uuid === id);
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
                                                    ) : null;
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3 rounded-lg border border-border p-3">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="scheduleEnabled"
                                                className="border-muted-foreground/50 bg-card"
                                                checked={values.scheduleEnabled}
                                                onCheckedChange={(checked) => setFieldValue("scheduleEnabled", checked === true)}
                                            />
                                            <Label htmlFor="scheduleEnabled" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                                <CalendarPlus className="h-4 w-4 text-muted-foreground" />
                                                Agendar aulas recorrentes
                                            </Label>
                                        </div>

                                        {values.scheduleEnabled && (
                                            <div className="space-y-4 pt-1">
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs text-muted-foreground">Professor</Label>
                                                        <div className="flex gap-1.5">
                                                            <Select
                                                                value={values.teacherId}
                                                                onValueChange={(v) => {
                                                                    const subjectStillValid = subjectTeachers.some(
                                                                        (st) => st.employee.uuid === v && st.subject.uuid === values.subjectId
                                                                    );
                                                                    setFieldValue("teacherId", v);
                                                                    if (!subjectStillValid) setFieldValue("subjectId", "");
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
                                                        <Label className="text-xs text-muted-foreground">Disciplina</Label>
                                                        <div className="flex gap-1.5">
                                                            <Select
                                                                value={values.subjectId}
                                                                onValueChange={(v) => {
                                                                    const teacherStillValid = subjectTeachers.some(
                                                                        (st) => st.subject.uuid === v && st.employee.uuid === values.teacherId
                                                                    );
                                                                    setFieldValue("subjectId", v);
                                                                    if (!teacherStillValid) setFieldValue("teacherId", "");
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
                                                        <Label className="text-xs text-muted-foreground">Sala</Label>
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
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

                                                <div className="space-y-2">
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
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {error && (
                                        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                            {error}
                                        </p>
                                    )}

                                    <div className="flex flex-row justify-end gap-4">
                                        <Button type="button" className="h-10 px-5 rounded-xl bg-red-400 text-sm font-semibold" onClick={() => { navigate("/class-groups") }}>
                                            Voltar
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting || !isValid} className="h-10 px-5 rounded-xl text-sm font-semibold">
                                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                            Salvar
                                        </Button>
                                    </div>
                                </Form>
                            );
                        }}
                    </Formik>
                </ContentCard>
            </div>
        </div>
    );
};
