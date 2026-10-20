import * as yup from "yup";

import { PASSWORD_REQUIREMENTS } from "@/validation/ProfileSchema";

const newPasswordFields = {
    password: yup.string()
        .required("Crie uma senha")
        .test("requirements", "A senha não cumpre todos os requisitos", (value = "") =>
            PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(value))),
    confirmPassword: yup.string()
        .required("Repita a senha")
        .oneOf([yup.ref("password")], "As senhas não coincidem"),
};

export const FirstAccessValidationSchema = yup.object({
    email: yup.string().trim().email("E-mail inválido").required("Informe o e-mail cadastrado"),
    ...newPasswordFields,
});

export const ResetPasswordValidationSchema = yup.object(newPasswordFields);

export const ForgotPasswordValidationSchema = yup.object({
    email: yup.string().trim().email("E-mail inválido").required("Informe o e-mail cadastrado"),
});
