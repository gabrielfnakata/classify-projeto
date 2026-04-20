import * as yup from "yup";

export const LoginValidationSchema = yup.object({
    email: yup.string().email('Invalid e-mail!').required('This field is required!'),
    password: yup.string()
    .required('This field is required!')
    .min(8)
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/[0-9]/)
});