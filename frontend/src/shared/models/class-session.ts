export interface ClassSession {
  id: string
  subject: string
  teacher: string
  studentOrClass: string
  startTime: string
  endTime: string
  room: string
  status: "info" | "success" | "warning" | "danger"
  description?: string
  date: string
  _classroomId?: string
  _employeeUuid?: string
  _subjectUuid?: string
  _studentIds?: string[]
  _students?: { uuid: string; name: string }[]
}
