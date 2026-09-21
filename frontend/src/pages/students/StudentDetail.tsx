import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router";
import { BookOpen } from "lucide-react";

import api from "@/services/api";
import useFetchList from "@/hooks/useFetchList";
import useFetchOne from "@/hooks/useFetchOne";
import useApiAction from "@/hooks/useApiAction";
import { EntityDetailLayout } from "@/components/features/entity-detail-layout";
import { LinkedEntitiesSection, type LinkedEntity } from "@/components/features/linked-entities-section";
import type { PickerOption } from "@/components/features/linked-entity-picker";
import { ScheduledSessionsList } from "@/components/features/scheduled-sessions-list";
import { SectionTitle } from "@/components/features/section-title";
import { EmptyState } from "@/components/common/empty-state";
import { ContentCard } from "@/components/layout/content-card";
import { formatDMY } from "@/shared/utils/date-formatter";
import { scheduleWindowQuery } from "@/shared/utils/schedule-window";
import { sortedByName } from "@/shared/utils/sort-by-name";
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO";
import type { ClassGroupDTO } from "@/shared/dtos/class-group/ClassGroupDTO";
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO";
import type { AddStudentsToClassGroupDTO } from "@/shared/dtos/class-group/AddStudentsToClassGroupDTO";
import type { ScheduleFormState } from "@/shared/models/forms/ScheduleFormState";

const EMPTY_CLASS_GROUPS: ClassGroupDTO[] = [];
const EMPTY_SESSIONS: ClassSessionDTO[] = [];

interface StudentSubject {
  uuid: string;
  description: string;
  teachers: string[];
}

export default function StudentDetail() {
  const { uuid = "" } = useParams<{ uuid: string }>();

  const { data: student, loading } = useFetchOne<StudentDTO>(`/student/${uuid}`);
  const { data: classGroupsData, refetch: refetchClassGroups } = useFetchList<ClassGroupDTO>("/class");
  const { data: sessionsData, refetch: refetchSessions } = useFetchList<ClassSessionDTO>(
    `/classsession/filter?studentUuid=${uuid}&${scheduleWindowQuery()}`
  );
  const classGroups = classGroupsData ?? EMPTY_CLASS_GROUPS;
  const sessions = sessionsData ?? EMPTY_SESSIONS;

  const [editingClassGroups, setEditingClassGroups] = useState(false);

  const { enrolled, available } = useMemo(() => {
    const enrolled: LinkedEntity[] = [];
    const available: PickerOption[] = [];

    for (const classGroup of sortedByName(classGroups)) {
      if (classGroup.students.some((s) => s.uuid === uuid)) {
        enrolled.push({
          uuid: classGroup.uuid,
          name: classGroup.name,
          subtitle: `${classGroup.students.length} aluno(s)`,
          description: classGroup.description ?? undefined,
        });
      } else {
        available.push({
          uuid: classGroup.uuid,
          label: classGroup.name,
          hint: classGroup.description ?? undefined,
        });
      }
    }

    return { enrolled, available };
  }, [classGroups, uuid]);

  const subjects = useMemo<StudentSubject[]>(() => {
    const byUuid = new Map<string, { description: string; teachers: Set<string> }>();

    for (const { subjectTeacher } of sessions) {
      const entry = byUuid.get(subjectTeacher.subject.uuid);
      if (entry) entry.teachers.add(subjectTeacher.employee.name);
      else byUuid.set(subjectTeacher.subject.uuid, {
        description: subjectTeacher.subject.description,
        teachers: new Set([subjectTeacher.employee.name]),
      });
    }

    return [...byUuid.entries()]
      .map(([subjectUuid, entry]) => ({
        uuid: subjectUuid,
        description: entry.description,
        teachers: [...entry.teachers].sort((a, b) => a.localeCompare(b, "pt-BR")),
      }))
      .sort((a, b) => a.description.localeCompare(b.description, "pt-BR"));
  }, [sessions]);

  const refreshAll = useCallback(() => {
    refetchClassGroups();
    refetchSessions();
  }, [refetchClassGroups, refetchSessions]);

  const { error, run, clearError } = useApiAction(refreshAll);

  const handleAdd = useCallback((classUuid: string) => {
    const payload: AddStudentsToClassGroupDTO = { studentUuids: [uuid] };
    return run(() => api.post(`/class/${classUuid}/students`, payload), "Não foi possível matricular o aluno na turma.");
  }, [run, uuid]);

  const handleRemove = useCallback((classUuid: string) =>
    run(() => api.delete(`/class/${classUuid}/students/${uuid}`, { data: {} }), "Não foi possível remover o aluno da turma."),
  [run, uuid]);

  const handleEditingChange = useCallback((next: boolean) => {
    clearError();
    setEditingClassGroups(next);
  }, [clearError]);

  const schedulePreset = useMemo<Partial<ScheduleFormState>>(
    () => ({ targetType: "student", studentIds: [uuid] }),
    [uuid]
  );

  const secondaryInfo = useCallback((session: ClassSessionDTO) =>
    `Prof. ${session.subjectTeacher.employee.name} · ${session.classDTO ? `Turma ${session.classDTO.name}` : "Aula individual"}`,
  []);

  const description = student
    ? [student.email, `CPF ${student.cpf}`, `Matrícula em ${formatDMY(new Date(student.registrationDate))}`].join(" · ")
    : undefined;

  return (
    <EntityDetailLayout
      title={student?.name ?? "Aluno"}
      description={description}
      backTo="/students"
      loading={loading && !student}
      editing={editingClassGroups}
      onEditingChange={handleEditingChange}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LinkedEntitiesSection
          title="Turmas"
          items={enrolled}
          editing={editingClassGroups}
          options={available}
          pickerPlaceholder="Buscar turma para matricular..."
          onAdd={handleAdd}
          onRemove={handleRemove}
          error={error}
          emptyTitle="Nenhuma turma"
          emptyDescription='Clique em "Editar" para matricular o aluno em uma turma.'
          emptyEditingDescription="Use a busca acima para matricular o aluno em uma turma."
          gridClassName="xl:grid-cols-2"
        />

        <ContentCard className="space-y-4">
          <SectionTitle
            title="Disciplinas"
            className="mb-5 md:items-center"
          />

          {subjects.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nenhuma disciplina"
              description="O aluno passa a cursar uma disciplina quando tem uma aula agendada dela."
            />
          ) : (
            <div className="grid max-h-[17rem] grid-cols-1 gap-3 overflow-y-auto pr-1 scrollbar-slim">
              {subjects.map((subject) => (
                <div
                  key={subject.uuid}
                  className="flex items-center gap-3 rounded-xl border border-border bg-panel-soft px-4 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{subject.description}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      Prof. {subject.teachers.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ContentCard>
      </div>

      <ScheduledSessionsList
        sessions={sessions}
        onChanged={refetchSessions}
        schedulePreset={schedulePreset}
        secondaryInfo={secondaryInfo}
      />
    </EntityDetailLayout>
  );
}
