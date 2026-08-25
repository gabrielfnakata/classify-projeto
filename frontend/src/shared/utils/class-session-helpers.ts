import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"
import type { ClassSessionStudentDTO } from "@/shared/dtos/class-session/ClassSessionStudentDTO"
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO"

export function sessionStudents(session: ClassSessionDTO): ClassSessionStudentDTO[] {
  return session.student ? [session.student] : []
}

export function classroomNameMap(classrooms: ClassroomDTO[]): Map<string, string> {
  return new Map(classrooms.map((classroom) => [classroom.uuid, classroom.name]))
}

export function resolveClassroomName(classroomsByUuid: Map<string, string>, classroomUuid: string): string {
  return classroomsByUuid.get(classroomUuid) ?? classroomUuid
}
