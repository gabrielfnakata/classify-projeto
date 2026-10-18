export type AttendanceStatus = "PRESENTE" | "AUSENTE"
export type JustificationReason = "ATESTADO_MEDICO" | "PROBLEMA_FAMILIAR" | "TRANSPORTE" | "OUTRO"

export interface AttendanceRosterEntryDTO {
    studentUuid: string,
    studentName: string,
    attendanceUuid: string | null,
    status: AttendanceStatus | null,
    justificationReason: JustificationReason | null,
    justificationNote: string | null,
};
