export interface ClassSessionApiDTO {
  uuid: string
  subjectTeacher: {
    uuid: string
    employee: { uuid: string; name: string }
    subject: { uuid: string; description: string }
  }
  startTime: string
  endTime: string
  report: { content: string } | null
  student: { uuid: string; name: string } | null
}
