import type { ClassSessionStudentDTO } from "./ClassSessionStudentDTO";
import type { ClassSessionSubjectTeacherDTO } from "./ClassSessionSubjectTeacherDTO";

export interface ClassSessionClassDTO {
    uuid: string,
    name: string,
    description: string | null,
    students: ClassSessionStudentDTO[],
};

export interface ClassSessionReportDTO {
    content: string,
};

export type ClassSessionStatus = "SCHEDULED" | "CANCELED";

export interface ClassSessionDTO {
    uuid: string,
    subjectTeacher: ClassSessionSubjectTeacherDTO,
    classroomUuid: string,
    startTime: Date,
    endTime: Date,
    report: ClassSessionReportDTO | null,
    classDTO: ClassSessionClassDTO | null,
    student: ClassSessionStudentDTO | null,
    recurrenceGroupUuid: string | null,
    status: ClassSessionStatus,
    cancellationReason: string | null,
};
