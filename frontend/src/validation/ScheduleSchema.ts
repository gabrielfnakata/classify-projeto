import * as yup from "yup"

export const ScheduleFormSchema = () =>
  yup.object({
    date: yup.string().required("A data do agendamento é obrigatória"),
    startTime: yup.string().required("O horário de início é obrigatório"),
    endTime: yup
      .string()
      .required("O horário de fim é obrigatório")
      .test("after-start", "O fim deve ser depois do início", function (endTime) {
        const { startTime } = this.parent
        if (!startTime || !endTime) return true
        return endTime > startTime
      }),
    teacherId: yup.string().required("É obrigatório selecionar um professor"),
    subjectId: yup.string().required("É obrigatório selecionar uma disciplina"),
    classroomId: yup.string().required("É obrigatório selecionar uma sala"),
    targetType: yup.string().oneOf(["student", "class"]).required(),
    studentIds: yup.array().when("targetType", {
      is: "student",
      then: (schema) => schema.min(1, "É obrigatório selecionar ao menos um aluno"),
    }),
    classGroupId: yup.string().when("targetType", {
      is: "class",
      then: (schema) => schema.required("É obrigatório selecionar uma turma"),
    }),
    isRecurring: yup.boolean(),
    recurringWeekdays: yup.array().when("isRecurring", {
      is: true,
      then: (schema) => schema.min(1, "É obrigatório selecionar ao menos um dia da semana"),
    }),
    recurringUntil: yup
      .string()
      .when("isRecurring", {
        is: true,
        then: (schema) =>
          schema
            .required("Informe até quando repetir")
            .test("after-date", "A data final deve ser igual ou depois da data inicial", function (until) {
              const { date } = this.parent
              if (!date || !until) return true
              return until >= date
            }),
      }),
  })
