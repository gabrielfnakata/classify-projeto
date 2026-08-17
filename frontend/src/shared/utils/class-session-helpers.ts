import type { ClassSessionDashboardDTO } from "@/shared/dtos/class-session/ClassSessionDashboardDTO"
import type { ClassSessionStudentDTO } from "@/shared/dtos/class-session/ClassSessionStudentDTO"
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO"

// A API só preenche um dos lados report/classDTO/student (turma x individual), e não
// existe endpoint para listar os alunos de uma turma, então uma sessão de turma não
// contribui nenhum aluno resolvível aqui.
export function sessionStudents(session: ClassSessionDashboardDTO): ClassSessionStudentDTO[] {
  return session.student ? [session.student] : []
}

export function classroomNameMap(classrooms: ClassroomDTO[]): Map<string, string> {
  return new Map(classrooms.map((classroom) => [classroom.uuid, classroom.name]))
}

export function resolveClassroomName(classroomsByUuid: Map<string, string>, classroomUuid: string): string {
  return classroomsByUuid.get(classroomUuid) ?? classroomUuid
}
