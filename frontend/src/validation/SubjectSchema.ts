import * as yup from "yup";

export const NewSubjectValidationSchema = yup.object({
    description: yup.string().required("A descrição da disciplina é obrigatória.")
});
