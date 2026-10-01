import * as yup from "yup"

export const ScheduleFormSchema = (isEditing: boolean) =>
  yup.object({
    date: yup.string().required("A data do agendamento é obrigatória"),
    startTime: yup.string().required("O horário de início do agendamento é obrigatório"),
    endTime: yup.string().required("O horário de término do agendamento é obrigatório"),
    teacherId: isEditing ? yup.string() : yup.string().required("É obrigatório selecionar um professor"),
    subjectId: isEditing ? yup.string() : yup.string().required("É obrigatório selecionar uma disciplina"),
    classroomId: isEditing ? yup.string() : yup.string().required("É obrigatório selecionar uma sala de aula"),
    studentIds: isEditing ? yup.array() : yup.array().min(1, "É obrigatório selecionar ao menos um aluno"),
  })
