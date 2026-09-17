import * as yup from "yup";

export const NewClassGroupValidationSchema = yup.object({
    name: yup.string().required("O nome da turma é obrigatório."),
    description: yup.string().max(50, "A descrição deve ter no máximo 50 caracteres."),
    scheduleEnabled: yup.boolean(),
    teacherId: yup.string().when("scheduleEnabled", {
        is: true,
        then: (schema) => schema.required("Selecione o professor"),
    }),
    subjectId: yup.string().when("scheduleEnabled", {
        is: true,
        then: (schema) => schema.required("Selecione a disciplina"),
    }),
    classroomId: yup.string().when("scheduleEnabled", {
        is: true,
        then: (schema) => schema.required("Selecione a sala"),
    }),
    date: yup.string().when("scheduleEnabled", {
        is: true,
        then: (schema) => schema.required("Informe a data"),
    }),
    startTime: yup.string().when("scheduleEnabled", {
        is: true,
        then: (schema) => schema.required("Informe o horário de início"),
    }),
    endTime: yup.string().when("scheduleEnabled", {
        is: true,
        then: (schema) => schema
            .required("Informe o horário de fim")
            .test("after-start", "O fim deve ser depois do início", function (endTime) {
                const { startTime } = this.parent;
                if (!startTime || !endTime) return true;
                return endTime > startTime;
            }),
    }),
    isRecurring: yup.boolean(),
    recurringWeekdays: yup.array().when(["scheduleEnabled", "isRecurring"], {
        is: (scheduleEnabled: boolean, isRecurring: boolean) => scheduleEnabled && isRecurring,
        then: (schema) => schema.min(1, "Selecione ao menos um dia da semana"),
    }),
    recurringUntil: yup.string().when(["scheduleEnabled", "isRecurring"], {
        is: (scheduleEnabled: boolean, isRecurring: boolean) => scheduleEnabled && isRecurring,
        then: (schema) => schema
            .required("Informe até quando repetir")
            .test("after-date", "A data final deve ser igual ou depois da data inicial", function (until) {
                const { date } = this.parent;
                if (!date || !until) return true;
                return until >= date;
            }),
    }),
});
