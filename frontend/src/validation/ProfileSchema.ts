import * as yup from "yup";

export const ProfileValidationSchema = (hasTelephone: boolean) => yup.object({
    name: yup.string().trim().required("O nome é obrigatório"),
    birthDate: yup.date()
        .required("A data de nascimento é obrigatória")
        .max(new Date(), "A data de nascimento não pode ser uma data futura."),
    telephone: yup.string()
        .transform((value?: string) => (value && /\d/.test(value) ? value : ""))
        .test("required-if-registered", "O telefone é obrigatório", (value) => !hasTelephone || Boolean(value))
        .matches(/^\(([0-9]{2})\) ([0-9]{5})-([0-9]{4})$/, { message: "Formato inválido.", excludeEmptyString: true }),
});

export const PASSWORD_REQUIREMENTS = [
    { label: "Ao menos 8 caracteres", test: (value: string) => value.length >= 8 },
    { label: "Uma letra maiúscula", test: (value: string) => /[A-Z]/.test(value) },
    { label: "Uma letra minúscula", test: (value: string) => /[a-z]/.test(value) },
    { label: "Um número", test: (value: string) => /[0-9]/.test(value) },
];

export const ChangePasswordValidationSchema = yup.object({
    currentPassword: yup.string().required("Informe a senha atual"),
    newPassword: yup.string()
        .required("Informe a nova senha")
        .test("requirements", "", (value = "") => PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(value)))
        .notOneOf([yup.ref("currentPassword")], "A nova senha deve ser diferente da atual"),
    confirmPassword: yup.string()
        .required("Confirme a nova senha")
        .oneOf([yup.ref("newPassword")], "As senhas não coincidem"),
});
