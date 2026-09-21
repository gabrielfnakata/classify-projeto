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
import { describeSessionTarget } from "@/shared/utils/class-session-helpers";
import { scheduleWindowQuery } from "@/shared/utils/schedule-window";
import { sortedByName } from "@/shared/utils/sort-by-name";
import type { SubjectDTO } from "@/shared/dtos/subject/SubjectDTO";
import type { EmployeeDTO } from "@/shared/dtos/employees/EmployeeDTO";
import type { SubjectTeacherDTO } from "@/shared/dtos/teacher/SubjectTeacherDTO";
import type { SubjectTeacherCreateDTO } from "@/shared/dtos/teacher/SubjectTeacherCreateDTO";
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO";
import type { ScheduleFormState } from "@/shared/models/forms/ScheduleFormState";

const EMPTY_LINKS: SubjectTeacherDTO[] = [];
const EMPTY_EMPLOYEES: EmployeeDTO[] = [];
const EMPTY_SESSIONS: ClassSessionDTO[] = [];

export default function SubjectDetail() {
  const { uuid = "" } = useParams<{ uuid: string }>();

  const { data: subject, loading } = useFetchOne<SubjectDTO>(`/subject/${uuid}`);
  const { data: linksData, refetch: refetchLinks } = useFetchList<SubjectTeacherDTO>("/subjectteacher");
  const { data: employeesData } = useFetchList<EmployeeDTO>("/employee");
  const { data: sessionsData, refetch: refetchSessions } = useFetchList<ClassSessionDTO>(
    `/classsession/filter?subjectUuid=${uuid}&${scheduleWindowQuery()}`
  );
  const links = linksData ?? EMPTY_LINKS;
  const employees = employeesData ?? EMPTY_EMPLOYEES;
  const sessions = sessionsData ?? EMPTY_SESSIONS;

  const [editing, setEditing] = useState(false);

  // Vínculos desta disciplina, indexados pelo professor (para remover pelo uuid do vínculo).
  const linkByEmployee = useMemo(() => {
    const map = new Map<string, SubjectTeacherDTO>();
    for (const link of links) {
      if (link.subject.uuid === uuid) map.set(link.employee.uuid, link);
    }
    return map;
  }, [links, uuid]);

  const teachers = useMemo<LinkedEntity[]>(() =>
    sortedByName([...linkByEmployee.values()].map((link) => ({ uuid: link.employee.uuid, name: link.employee.name }))),
  [linkByEmployee]);

  const employeeOptions = useMemo<PickerOption[]>(() =>
    sortedByName(employees.filter((employee) => !linkByEmployee.has(employee.uuid)))
      .map((employee) => ({ uuid: employee.uuid, label: employee.name, hint: employee.cpf })),
  [employees, linkByEmployee]);

  const { error, run, clearError } = useApiAction(refetchLinks);

  const handleAdd = useCallback((employeeId: string) => {
    const payload: SubjectTeacherCreateDTO = { employeeId, subjectId: uuid };
    return run(() => api.post("/subjectteacher", payload), "Não foi possível vincular o professor.");
  }, [run, uuid]);

  const handleRemove = useCallback((employeeUuid: string) => {
    const link = linkByEmployee.get(employeeUuid);
    if (!link) return;
    return run(() => api.delete(`/subjectteacher/${link.uuid}`, { data: {} }), "Não foi possível desvincular o professor.");
  }, [run, linkByEmployee]);

  const handleEditingChange = useCallback((next: boolean) => {
    clearError();
    setEditing(next);
  }, [clearError]);

  const secondaryInfo = useCallback((session: ClassSessionDTO) =>
    `Prof. ${session.subjectTeacher.employee.name} · ${describeSessionTarget(session)}`,
  []);

  const schedulePreset = useMemo<Partial<ScheduleFormState>>(() => ({ subjectId: uuid }), [uuid]);

  return (
    <EntityDetailLayout
      title={subject?.description ?? "Disciplina"}
      description={subject ? `${teachers.length} professor(es) · ${sessions.length} aula(s) agendada(s)` : undefined}
      backTo="/subjects"
      loading={loading && !subject}
      editing={editing}
      onEditingChange={handleEditingChange}
    >
      <LinkedEntitiesSection
        title="Professores"
        description="Adicione ou remova professores desta disciplina."
        items={teachers}
        editing={editing}
        options={employeeOptions}
        pickerPlaceholder="Buscar professor para vincular..."
        onAdd={handleAdd}
        onRemove={handleRemove}
        error={error}
        emptyTitle="Nenhum professor vinculado"
        emptyDescription='Clique em "Editar" para vincular professores a esta disciplina.'
        emptyEditingDescription="Use a busca acima para vincular um professor."
      />

      <ScheduledSessionsList
        sessions={sessions}
        onChanged={refetchSessions}
        schedulePreset={schedulePreset}
        secondaryInfo={secondaryInfo}
      />
    </EntityDetailLayout>
  );
}
