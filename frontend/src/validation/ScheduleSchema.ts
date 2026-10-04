import * as yup from "yup"

export const ScheduleFormSchema = () =>
  yup.object({
    date: yup.string().required("Informe a data"),
    startTime: yup.string().required("Informe o horário de início"),
    endTime: yup
      .string()
      .required("Informe o horário de fim")
      .test("after-start", "O fim deve ser depois do início", function (endTime) {
        const { startTime } = this.parent
        if (!startTime || !endTime) return true
        return endTime > startTime
      }),
    teacherId: yup.string().required("Selecione o professor"),
    subjectId: yup.string().required("Selecione a disciplina"),
    classroomId: yup.string().required("Selecione a sala"),
    targetType: yup.string().oneOf(["student", "class"]).required(),
    studentIds: yup.array().when("targetType", {
      is: "student",
      then: (schema) => schema.min(1, "Selecione ao menos um aluno"),
    }),
    classGroupId: yup.string().when("targetType", {
      is: "class",
      then: (schema) => schema.required("Selecione a turma"),
    }),
    isRecurring: yup.boolean(),
    recurringWeekdays: yup.array().when("isRecurring", {
      is: true,
      then: (schema) => schema.min(1, "Selecione ao menos um dia da semana"),
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
