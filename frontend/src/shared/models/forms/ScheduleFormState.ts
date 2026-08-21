export interface ScheduleFormState {
  date: string
  startTime: string
  endTime: string
  teacherId: string
  subjectId: string
  classroomId: string
  studentId: string
}

export const EMPTY_SCHEDULE_FORM: ScheduleFormState = {
  date: "", startTime: "", endTime: "",
  teacherId: "", subjectId: "", classroomId: "", studentId: "",
}
