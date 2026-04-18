import * as yup from "yup";

export const LoginValidationSchema = yup.object({
    user: yup.string().required(),
    password: yup.string()
    .required()
    .min(8)
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/[0-9]/)
});