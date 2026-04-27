import * as yup from "yup";

export const LoginValidationSchema = yup.object({
    cpf: yup.string().matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/, 'Invalid CPF').required('This field is required!'),
    password: yup.string()
    .required('This field is required!')
    .min(8)
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/[0-9]/)
});