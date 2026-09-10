export interface ClassSessionSubjectTeacherDTO {
    uuid: string,
    employee: { uuid: string; name: string },
    subject: { uuid: string; description: string }
};