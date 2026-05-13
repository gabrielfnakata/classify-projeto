import * as yup from "yup";

export const SignupValidationSchema = yup.object({
    cpf: yup.string()
        .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
        .required('Este campo é obrigatório!'),
    password: yup.string()
        .required('Este campo é obrigatório!')
        .min(8, 'Senha precisa de pelo menos 8 caracteres')
        .matches(/[a-z]/, 'Senha precisa de uma letra minúscula')
        .matches(/[A-Z]/, 'Senha precisa de uma letra maiúscula')
        .matches(/[0-9]/, 'Senha precisa de um número'),
    confirmPassword: yup.string()
        .required('Este campo é obrigatório!')
        .oneOf([yup.ref('password')], 'As senhas não conferem')
});
