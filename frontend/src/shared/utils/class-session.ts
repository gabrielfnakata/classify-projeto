import { toDate } from "@/shared/utils/date-formatter"
import type { ClassSessionApiDTO } from "@/shared/dtos/class-session/ClassSessionApiDTO"

export type SessionStatus = "info" | "success"

export function sessionStatus(session: ClassSessionApiDTO): SessionStatus {
  return toDate(session.endTime) < new Date() ? "success" : "info"
}
