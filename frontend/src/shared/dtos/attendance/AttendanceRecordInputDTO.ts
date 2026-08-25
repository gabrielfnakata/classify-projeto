import type { AttendanceStatus, JustificationReason } from "./AttendanceRosterEntryDTO"

export interface AttendanceRecordInputDTO {
    studentUuid: string,
    status: AttendanceStatus,
    justificationReason: JustificationReason | null,
    justificationNote: string | null,
};
