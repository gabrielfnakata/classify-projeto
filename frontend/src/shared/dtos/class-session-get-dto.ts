export interface ClassSessionGetDTO {
  uuid: string
  subjectTeacher: {
    uuidEmployee: string
    employee: string
    uuidSubject: string
    subject: string
  }
  classroom: {
    uuid: string
    name: string
  }
  startTime: string
  endTime: string
  students: {
    uuid: string
    name: string
  }[]
}
