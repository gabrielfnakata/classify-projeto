import * as yup from "yup";

export const LoginValidationSchema = yup.object({
    password: yup.string()
    .required('This field is required!')
    .min(8)
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/[0-9]/)
});