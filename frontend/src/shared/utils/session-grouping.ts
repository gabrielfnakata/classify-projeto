import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"

export interface SessionGroup {
  key: string
  sessions: ClassSessionDTO[]
}


function groupKey(session: ClassSessionDTO): string {
  return session.student
    ? `${session.startTime}|${session.endTime}|${session.subjectTeacher.uuid}|${session.classroomUuid}`
    : `single:${session.uuid}`
}

export function groupSessions(sessions: ClassSessionDTO[]): SessionGroup[] {
  const groups = new Map<string, ClassSessionDTO[]>()

  sessions.forEach((session) => {
    const key = groupKey(session)
    const existing = groups.get(key)
    if (existing) existing.push(session)
    else groups.set(key, [session])
  })

  return Array.from(groups.entries()).map(([key, groupSessionsList]) => ({ key, sessions: groupSessionsList }))
}


export function groupRecurrenceUuid(group: SessionGroup): string | null {
  return group.sessions.find((s) => s.recurrenceGroupUuid)?.recurrenceGroupUuid ?? null
}
