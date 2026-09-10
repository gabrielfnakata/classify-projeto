import type { AttendanceStatus, JustificationReason } from "./AttendanceRosterEntryDTO"

export interface AttendanceGetDTO {
    uuid: string,
    classSessionUuid: string,
    studentUuid: string,
    studentName: string,
    status: AttendanceStatus,
    justificationReason: JustificationReason | null,
    justificationNote: string | null,
};
