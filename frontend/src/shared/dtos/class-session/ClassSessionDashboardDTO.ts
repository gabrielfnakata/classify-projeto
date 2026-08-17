import type { ClassSessionStudentDTO } from "./ClassSessionStudentDTO";

export interface ClassSessionDashboardSubjectTeacherDTO {
    uuid: string,
    employee: { uuid: string; name: string },
    subject: { uuid: string; description: string }
};

export interface ClassSessionDashboardClassDTO {
    uuid: string,
    name: string,
    description: string | null,
};

export interface ClassSessionDashboardReportDTO {
    content: string,
};

export interface ClassSessionDashboardDTO {
    uuid: string,
    subjectTeacher: ClassSessionDashboardSubjectTeacherDTO,
    classroomUuid: string,
    startTime: Date,
    endTime: Date,
    report: ClassSessionDashboardReportDTO | null,
    classDTO: ClassSessionDashboardClassDTO | null,
    student: ClassSessionStudentDTO | null,
};
