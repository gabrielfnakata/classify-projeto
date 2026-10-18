import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO";
import type { ClassSessionStudentDTO } from "@/shared/dtos/class-session/ClassSessionStudentDTO";
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO";
import type { ClassGroupDTO } from "@/shared/dtos/class-group/ClassGroupDTO";
import { toDate } from "@/shared/utils/date-formatter";

export const sessionStart = (session: ClassSessionDTO): Date => toDate(session.startTime);
export const sessionEnd = (session: ClassSessionDTO): Date => toDate(session.endTime);

export const isCanceled = (session: ClassSessionDTO): boolean => session.status === "CANCELED";

export function isSessionActiveAt(session: ClassSessionDTO, at: number): boolean {
  if (isCanceled(session)) return false;
  return sessionStart(session).getTime() <= at && at < sessionEnd(session).getTime();
}

/** Quantas pessoas a aula coloca na sala: a turma inteira ou o aluno individual. */
export function sessionAttendeeCount(session: ClassSessionDTO): number {
  if (session.classDTO) return session.classDTO.studentCount;
  return session.student ? 1 : 0;
}

export function describeSessionTarget(session: ClassSessionDTO): string {
  if (session.classDTO) return `Turma ${session.classDTO.name}`;
  if (session.student) return `Aluno ${session.student.name}`;
  return "Sem participantes";
}

// A API só preenche um dos lados report/classDTO/student (turma x individual), e não
// existe endpoint para listar os alunos de uma turma, então uma sessão de turma não
// contribui nenhum aluno resolvível aqui.
export function sessionStudents(session: ClassSessionDTO): ClassSessionStudentDTO[] {
  return session.student ? [session.student] : [];
}

export interface ScopeOption {
  uuid: string
  name: string
}

function sortedOptions(map: Map<string, ScopeOption>): ScopeOption[] {
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}

// Alunos e turmas que um professor leciona: alunos de aula individual mais os
// alunos das turmas dele (a sessão de turma não traz a lista, ela vem de /class).
export function buildTeachingScope(
  sessions: ClassSessionDTO[],
  classGroups: ClassGroupDTO[],
  teacherUuid: string
): { students: ScopeOption[]; classes: ScopeOption[] } {
  const mySessions = sessions.filter((s) => s.subjectTeacher.employee.uuid === teacherUuid)
  const rosterByClass = buildClassRosters(classGroups)

  const classes = new Map<string, ScopeOption>()
  const students = new Map<string, ScopeOption>()

  mySessions.forEach((session) => {
    sessionStudents(session).forEach((st) => students.set(st.uuid, { uuid: st.uuid, name: st.name }))

    if (session.classDTO) {
      classes.set(session.classDTO.uuid, { uuid: session.classDTO.uuid, name: session.classDTO.name })
      ;(rosterByClass.get(session.classDTO.uuid) ?? []).forEach((st) =>
        students.set(st.uuid, { uuid: st.uuid, name: st.name })
      )
    }
  })

  return { students: sortedOptions(students), classes: sortedOptions(classes) }
}

export function buildClassRosters(classGroups: ClassGroupDTO[]): Map<string, ScopeOption[]> {
  return new Map(classGroups.map((c) => [c.uuid, c.students]))
}

// Alunos de qualquer aula: o aluno da aula individual ou a lista da turma (vinda de /class).
export function sessionStudentUuids(session: ClassSessionDTO, rosters: Map<string, ScopeOption[]>): string[] {
  if (session.student) return [session.student.uuid]
  if (session.classDTO) return (rosters.get(session.classDTO.uuid) ?? []).map((s) => s.uuid)
  return []
}

export function classroomNameMap(classrooms: ClassroomDTO[]): Map<string, string> {
  return new Map(classrooms.map((classroom) => [classroom.uuid, classroom.name]));
}

export function resolveClassroomName(classroomsByUuid: Map<string, string>, classroomUuid: string): string {
  return classroomsByUuid.get(classroomUuid) ?? classroomUuid;
}
