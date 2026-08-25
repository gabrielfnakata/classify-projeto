export type ScheduleTargetType = "student" | "class"

export interface ScheduleFormState {
  date: string
  startTime: string
  endTime: string
  teacherId: string
  subjectId: string
  classroomId: string
  targetType: ScheduleTargetType
  studentIds: string[]
  classGroupId: string
  isRecurring: boolean
  recurringWeekdays: number[]
  recurringUntil: string
}

export const EMPTY_SCHEDULE_FORM: ScheduleFormState = {
  date: "", startTime: "", endTime: "",
  teacherId: "", subjectId: "", classroomId: "",
  targetType: "student", studentIds: [], classGroupId: "",
  isRecurring: false, recurringWeekdays: [], recurringUntil: "",
}
