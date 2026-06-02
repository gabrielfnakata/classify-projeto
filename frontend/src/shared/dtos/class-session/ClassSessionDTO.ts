import type { ClassSessionClassroomDTO } from "./ClassSessionClassroomDTO";
import type { ClassSessionStudentDTO } from "./ClassSessionStudentDTO";
import type { ClassSessionSubjectTeacherDTO } from "./ClassSessionSubjectTeacherDTO";

export interface ClassSessionDTO {
    uuid: string,
    subjectTeacher: ClassSessionSubjectTeacherDTO,
    classroom: ClassSessionClassroomDTO,
    startTime: Date,
    endTime: Date,
    students: ClassSessionStudentDTO[]
};