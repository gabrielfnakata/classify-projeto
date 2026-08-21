import type { ReportCreateDTO } from "../report/ReportCreateDTO";

export interface ClassSessionUpdateDTO {
    subjectTeacherId?: string;
    classroomUuid?: string;
    startTime?: string;
    endTime?: string;
    report?: ReportCreateDTO;
    classUuid?: string;
    studentUuid?: string;
}
