import * as yup from "yup";

export const NewStudentValidationSchema = yup.object({
    name: yup.string().required(),
    birthDate: yup.date().required(),
    email: yup.string().email().required(),
    cpf: yup.string().required(),
    registrationDate: yup.date().required(),
    telephone1: yup.string().required(),
    telephone2: yup.string(),
});