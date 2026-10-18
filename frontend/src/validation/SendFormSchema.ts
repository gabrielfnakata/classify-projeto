import * as Yup from "yup";
import {FormAssignType} from "@/shared/models/enums/form-assign-type.ts";

export const SendFormSchema = Yup.object({
    type: Yup.string().oneOf(Object.values(FormAssignType)).required(),
    formUuid: Yup.string().required(),
    students: Yup.array().when("type", {
        is: FormAssignType.STUDENT,
        then: (schema) => schema.min(1, "Selecione ao menos um aluno").required(),
        otherwise: (schema) => schema.notRequired(),
    }),
    classGroup: Yup.object({
        value: Yup.string().length(36, 'UUID inválido').required().nonNullable(),
        label: Yup.string().min(1).required().nonNullable()
    }).when("type", {
        is: FormAssignType.CLASS,
        then: (schema) => schema.nonNullable().required("Selecione uma turma"),
        otherwise: (schema) => schema.notRequired(),
    }),
});
