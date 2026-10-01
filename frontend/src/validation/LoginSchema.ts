import * as yup from "yup";

export const LoginValidationSchema = yup.object({
    email: yup.string().email("E-mail inválido").required("O e-mail é obrigatório"),
    password: yup.string()
    .required("A senha é obrigatória")
    .min(8, "A senha deve conter pelo menos 8 caracteres")
});
