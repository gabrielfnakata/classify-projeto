import * as yup from "yup";

export const NewClassroomValidationSchema = yup.object({
    name: yup.string().required("O nome é obrigatório"),
    capacity: yup.number().required("A capacidade é obrigatória").min(1, "A capacidade deve ser maior do que um"),
    isDisabled: yup.boolean().required("É obrigatório informar se a sala está desativada")
});
