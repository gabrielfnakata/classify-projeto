export interface SubjectTeacherDTO {
  uuid: string
  employee: { uuid: string; name: string }
  subject: { uuid: string; description: string }
}
