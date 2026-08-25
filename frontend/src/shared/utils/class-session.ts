import { toDate } from "@/shared/utils/date-formatter"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"

// mesma paleta de status do schedule-calendar.tsx (agenda do professor)
export type SessionStatus = "info" | "success"

export function sessionStatus(session: ClassSessionDTO): SessionStatus {
  return toDate(session.endTime) < new Date() ? "success" : "info"
}
