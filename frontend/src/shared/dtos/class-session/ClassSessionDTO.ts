import type { ClassSessionClassDTO } from "./ClassSessionClassDTO";
import type { ClassSessionReportDTO } from "./ClassSessionReportDTO";
import type { ClassSessionStudentDTO } from "./ClassSessionStudentDTO";
import type { ClassSessionSubjectTeacherDTO } from "./ClassSessionSubjectTeacherDTO";

export interface ClassSessionDTO {
    uuid: string,
    subjectTeacher: ClassSessionSubjectTeacherDTO,
    classroomUuid: string,
    startTime: Date,
    endTime: Date,
    report: ClassSessionReportDTO | null,
    classDTO: ClassSessionClassDTO | null,
    student: ClassSessionStudentDTO | null,
};