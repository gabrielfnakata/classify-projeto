import * as yup from "yup"

export const ScheduleFormSchema = (isEditing: boolean) =>
  yup.object({
    date: yup.string().required(),
    startTime: yup.string().required(),
    endTime: yup.string().required(),
    teacherId: isEditing ? yup.string() : yup.string().required(),
    subjectId: isEditing ? yup.string() : yup.string().required(),
    classroomId: isEditing ? yup.string() : yup.string().required(),
    studentIds: isEditing ? yup.array() : yup.array().min(1),
  })
