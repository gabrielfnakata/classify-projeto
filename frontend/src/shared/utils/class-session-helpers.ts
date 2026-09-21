import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO";
import type { ClassSessionStudentDTO } from "@/shared/dtos/class-session/ClassSessionStudentDTO";
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO";
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
  if (session.classDTO) return session.classDTO.students.length;
  return session.student ? 1 : 0;
}

export function describeSessionTarget(session: ClassSessionDTO): string {
  if (session.classDTO) return `Turma ${session.classDTO.name}`;
  if (session.student) return `Aluno ${session.student.name}`;
  return "Sem participantes";
}

export function sessionStudents(session: ClassSessionDTO): ClassSessionStudentDTO[] {
  return session.student ? [session.student] : [];
}

export function classroomNameMap(classrooms: ClassroomDTO[]): Map<string, string> {
  return new Map(classrooms.map((classroom) => [classroom.uuid, classroom.name]));
}

export function resolveClassroomName(classroomsByUuid: Map<string, string>, classroomUuid: string): string {
  return classroomsByUuid.get(classroomUuid) ?? classroomUuid;
}
