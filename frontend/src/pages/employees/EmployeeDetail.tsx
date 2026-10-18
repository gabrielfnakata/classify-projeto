import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router";

import api from "@/services/api";
import useFetchList from "@/hooks/useFetchList";
import useFetchOne from "@/hooks/useFetchOne";
import useApiAction from "@/hooks/useApiAction";
import { EntityDetailLayout } from "@/components/features/entity-detail-layout";
import { LinkedEntitiesSection, type LinkedEntity } from "@/components/features/linked-entities-section";
import type { PickerOption } from "@/components/features/linked-entity-picker";
import { ScheduledSessionsList } from "@/components/features/scheduled-sessions-list";
import { TeacherAvailabilitySection } from "@/components/features/teacher-availability-section";
import { classroomNameMap, describeSessionTarget, resolveClassroomName } from "@/shared/utils/class-session-helpers";
import { scheduleWindowQuery } from "@/shared/utils/schedule-window";
import type { EmployeeDTO } from "@/shared/dtos/employees/EmployeeDTO";
import type { SubjectDTO } from "@/shared/dtos/subject/SubjectDTO";
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO";
import type { SubjectTeacherDTO } from "@/shared/dtos/teacher/SubjectTeacherDTO";
import type { SubjectTeacherCreateDTO } from "@/shared/dtos/teacher/SubjectTeacherCreateDTO";
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO";
import type { ScheduleFormState } from "@/shared/models/forms/ScheduleFormState";

const EMPTY_LINKS: SubjectTeacherDTO[] = [];
const EMPTY_SUBJECTS: SubjectDTO[] = [];
const EMPTY_CLASSROOMS: ClassroomDTO[] = [];
const EMPTY_SESSIONS: ClassSessionDTO[] = [];

export default function EmployeeDetail() {
  const { uuid = "" } = useParams<{ uuid: string }>();

  const { data: employee, loading } = useFetchOne<EmployeeDTO>(`/employee/${uuid}`);
  const { data: linksData, refetch: refetchLinks } = useFetchList<SubjectTeacherDTO>("/subjectteacher");
  const { data: subjectsData } = useFetchList<SubjectDTO>("/subject");
  const { data: classroomsData } = useFetchList<ClassroomDTO>("/classroom");
  const { data: sessionsData, refetch: refetchSessions } = useFetchList<ClassSessionDTO>(
    `/classsession/filter?employeeUuid=${uuid}&${scheduleWindowQuery()}`
  );
  const links = linksData ?? EMPTY_LINKS;
  const subjects = subjectsData ?? EMPTY_SUBJECTS;
  const classrooms = classroomsData ?? EMPTY_CLASSROOMS;
  const sessions = sessionsData ?? EMPTY_SESSIONS;

  const [editing, setEditing] = useState(false);

  const linkBySubject = useMemo(() => {
    const map = new Map<string, SubjectTeacherDTO>();
    for (const link of links) {
      if (link.employee.uuid === uuid) map.set(link.subject.uuid, link);
    }
    return map;
  }, [links, uuid]);

  const taughtSubjects = useMemo<LinkedEntity[]>(() =>
    [...linkBySubject.values()]
      .map((link) => ({ uuid: link.subject.uuid, name: link.subject.description }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
  [linkBySubject]);

  const subjectOptions = useMemo<PickerOption[]>(() =>
    subjects
      .filter((subject) => !linkBySubject.has(subject.uuid))
      .map((subject) => ({ uuid: subject.uuid, label: subject.description })),
  [subjects, linkBySubject]);

  const { error, run, clearError } = useApiAction(refetchLinks);

  const handleAdd = useCallback((subjectId: string) => {
    const payload: SubjectTeacherCreateDTO = { employeeId: uuid, subjectId };
    return run(() => api.post("/subjectteacher", payload), "Não foi possível vincular a disciplina.");
  }, [run, uuid]);

  const handleRemove = useCallback((subjectUuid: string) => {
    const link = linkBySubject.get(subjectUuid);
    if (!link) return;
    return run(() => api.delete(`/subjectteacher/${link.uuid}`, { data: {} }), "Não foi possível desvincular a disciplina.");
  }, [run, linkBySubject]);

  const handleEditingChange = useCallback((next: boolean) => {
    clearError();
    setEditing(next);
  }, [clearError]);

  const classroomNames = useMemo(() => classroomNameMap(classrooms), [classrooms]);

  const secondaryInfo = useCallback((session: ClassSessionDTO) =>
    `${describeSessionTarget(session)} · Sala ${resolveClassroomName(classroomNames, session.classroomUuid)}`,
  [classroomNames]);

  const schedulePreset = useMemo<Partial<ScheduleFormState>>(() => ({ teacherId: uuid }), [uuid]);

  return (
    <EntityDetailLayout
      title={employee?.name ?? "Professor"}
      description={employee ? `CPF ${employee.cpf}` : undefined}
      backTo="/employees"
      loading={loading && !employee}
      editing={editing}
      onEditingChange={handleEditingChange}
    >
      <LinkedEntitiesSection
        title="Disciplinas"
        description="Vincule ou desvincule disciplinas deste professor."
        items={taughtSubjects}
        editing={editing}
        options={subjectOptions}
        pickerPlaceholder="Buscar disciplina para vincular..."
        onAdd={handleAdd}
        onRemove={handleRemove}
        error={error}
        emptyTitle="Nenhuma disciplina vinculada"
        emptyDescription='Clique em "Editar" para vincular disciplinas a este professor.'
        emptyEditingDescription="Use a busca acima para vincular uma disciplina."
      />

      <TeacherAvailabilitySection employeeUuid={uuid} editing={editing} />

      <ScheduledSessionsList
        sessions={sessions}
        onChanged={refetchSessions}
        schedulePreset={schedulePreset}
        secondaryInfo={secondaryInfo}
      />
    </EntityDetailLayout>
  );
}
