import * as yup from "yup";

export const SignupValidationSchema = yup.object({
    cpf: yup.string()
        .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
        .required('Este campo é obrigatório!'),
    password: yup.string()
        .required('Este campo é obrigatório!')
        .min(3, 'Senha precisa de pelo menos 3 dígitos'),
    confirmPassword: yup.string()
        .required('Este campo é obrigatório!')
        .oneOf([yup.ref('password')], 'As senhas não conferem')
});
