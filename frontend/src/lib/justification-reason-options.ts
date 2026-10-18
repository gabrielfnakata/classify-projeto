import type { JustificationReason } from "@/shared/dtos/attendance/AttendanceRosterEntryDTO"

export const JUSTIFICATION_REASON_LABELS: Record<JustificationReason, string> = {
  ATESTADO_MEDICO: "Atestado médico",
  PROBLEMA_FAMILIAR: "Problema familiar",
  TRANSPORTE: "Transporte",
  OUTRO: "Outro",
}

export const JUSTIFICATION_REASON_OPTIONS = (
  Object.entries(JUSTIFICATION_REASON_LABELS) as [JustificationReason, string][]
).map(([value, label]) => ({ value, label }))
