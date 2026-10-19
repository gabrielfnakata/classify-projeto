import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, Loader2, Pencil, Trash2, TriangleAlert, X } from "lucide-react";

import useFetchList from "@/hooks/useFetchList";
import useFetchOne from "@/hooks/useFetchOne";
import useApiAction from "@/hooks/useApiAction";
import api from "@/services/api";
import { LinkedEntitiesSection, type LinkedEntity } from "@/components/features/linked-entities-section";
import type { PickerOption } from "@/components/features/linked-entity-picker";
import { ScheduledSessionsList } from "@/components/features/scheduled-sessions-list";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sortedByName } from "@/shared/utils/sort-by-name";
import { apiErrorMessage } from "@/shared/utils/api-error";
import { scheduleWindowQuery } from "@/shared/utils/schedule-window";
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO";
import type { ClassGroupDTO } from "@/shared/dtos/class-group/ClassGroupDTO";
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO";
import type { AddStudentsToClassGroupDTO } from "@/shared/dtos/class-group/AddStudentsToClassGroupDTO";
import type { ClassGroupUpdateDTO } from "@/shared/dtos/class-group/ClassGroupUpdateDTO";
import type { ScheduleFormState } from "@/shared/models/forms/ScheduleFormState";

const EMPTY_STUDENTS: StudentDTO[] = [];
const EMPTY_SESSIONS: ClassSessionDTO[] = [];

export default function ClassGroupDetail() {
  const { uuid = "" } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: classGroup, refetch: refetchClassGroup } = useFetchOne<ClassGroupDTO>(`/class/${uuid}`);
  const { data: studentsData } = useFetchList<StudentDTO>("/student");
  const { data: sessionsData, refetch: refetchSessions } = useFetchList<ClassSessionDTO>(
    `/classsession/filter?classUuid=${uuid}&${scheduleWindowQuery()}`
  );
  const students = studentsData ?? EMPTY_STUDENTS;
  const sessions = sessionsData ?? EMPTY_SESSIONS;

  const [warning, setWarning] = useState<string | null>(
    (location.state as { warning?: string } | null)?.warning ?? null
  );

  const { error: linkError, run, clearError } = useApiAction(refetchClassGroup);

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  const startEditing = () => {
    setDraftName(classGroup?.name ?? "");
    setDraftDescription(classGroup?.description ?? "");
    setInfoError(null);
    clearError();
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setInfoError(null);
    clearError();
    setIsEditing(false);
  };

  const saveInfo = async () => {
    if (!draftName.trim()) {
      setInfoError("O nome da turma não pode ficar vazio.");
      return;
    }

    setSavingInfo(true);
    setInfoError(null);
    try {
      const payload: ClassGroupUpdateDTO = {
        name: draftName.trim(),
        description: draftDescription.trim(),
      };
      await api.put(`/class/${uuid}`, payload);
      refetchClassGroup();
      setIsEditing(false);
    } catch (err: unknown) {
      setInfoError(apiErrorMessage(err, "Não foi possível salvar os dados da turma."));
    } finally {
      setSavingInfo(false);
    }
  };

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteClassGroup = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/class/${uuid}`, { data: {} });
      navigate("/class-groups");
    } catch (err: unknown) {
      setDeleteError(apiErrorMessage(err, "Não foi possível excluir a turma."));
    } finally {
      setDeleting(false);
    }
  };

  const studentByUuid = useMemo(
    () => new Map(students.map((student) => [student.uuid, student])),
    [students]
  );

  const enrolledStudents = useMemo<LinkedEntity[]>(() =>
    sortedByName(classGroup?.students ?? []).map((student) => ({
      uuid: student.uuid,
      name: student.name,
      subtitle: studentByUuid.get(student.uuid)?.email,
    })),
  [classGroup, studentByUuid]);

  const studentOptions = useMemo<PickerOption[]>(() => {
    const enrolled = new Set((classGroup?.students ?? []).map((student) => student.uuid));
    return sortedByName(students.filter((student) => !enrolled.has(student.uuid)))
      .map((student) => ({ uuid: student.uuid, label: student.name, hint: student.email }));
  }, [students, classGroup]);

  const handleAdd = useCallback((studentUuid: string) => {
    const payload: AddStudentsToClassGroupDTO = { studentUuids: [studentUuid] };
    return run(() => api.post(`/class/${uuid}/students`, payload), "Erro ao matricular aluno.");
  }, [run, uuid]);

  const handleRemove = useCallback((studentUuid: string) =>
    run(() => api.delete(`/class/${uuid}/students/${studentUuid}`, { data: {} }), "Erro ao remover aluno."),
  [run, uuid]);

  const schedulePreset = useMemo<Partial<ScheduleFormState>>(
    () => ({ targetType: "class", classGroupId: uuid }),
    [uuid]
  );

  const secondaryInfo = useCallback(
    (session: ClassSessionDTO) => `Prof. ${session.subjectTeacher.employee.name}`,
    []
  );

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
          {infoError && (
            <p className="mt-2 text-sm text-destructive">{infoError}</p>
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
                onClick={() => { setDeleteError(null); setConfirmDeleteOpen(true); }}
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

      <LinkedEntitiesSection
        title="Alunos Matriculados"
        description="Adicione ou remova alunos da turma."
        items={enrolledStudents}
        editing={isEditing}
        options={studentOptions}
        pickerPlaceholder="Buscar aluno para adicionar..."
        onAdd={handleAdd}
        onRemove={handleRemove}
        error={linkError}
        emptyTitle="Nenhum aluno matriculado"
        emptyDescription='Clique em "Editar" para matricular alunos.'
        emptyEditingDescription="Use a busca acima para adicionar alunos a essa turma."
      />

      <ScheduledSessionsList
        sessions={sessions}
        onChanged={refetchSessions}
        schedulePreset={schedulePreset}
        secondaryInfo={secondaryInfo}
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
  );
}
