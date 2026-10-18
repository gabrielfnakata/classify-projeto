import * as yup from "yup";

export const NewStudentValidationSchema = yup.object({
    name: yup.string().required("O nome é obrigatório"),
    birthDate: yup.date()
        .required("A data de nascimento é obrigatória")
        .max(new Date(), "A data de nascimento não pode ser uma data futura.")
        .test(
            "birth-before-hire",
            "A data de nascimento deve ser anterior à data de matrícula.",
            function (value) {
                const {registrationDate} = this.parent;
                if (!value || !registrationDate) return true;
                return value < registrationDate;
            },
        ),
    email: yup.string().email().required("O e-mail é obrigatório"),
    cpf: yup.string().required("O CPF é obrigatório"),
    registrationDate: yup.date().required("A data de matrícula é obrigatória"),
    telephone1: yup.string().notRequired().matches(/^\(([0-9]{2})\) ([0-9]{5})-([0-9]{4})$/, { message: "Formato inválido.", excludeEmptyString: true }),
    telephone2: yup.string().notRequired().matches(/^\(([0-9]{2})\) ([0-9]{5})-([0-9]{4})$/, { message: "Formato inválido.", excludeEmptyString: true }),
    accountEmail: yup.string().email("Informe um e-mail de acesso válido.").notRequired(),
    accountPassword: yup.string().notRequired(),
}).test(
    "account-credentials",
    "Os dados de acesso são obrigatórios.",
    function (values) {
        const accountEmail = values?.accountEmail?.trim();
        const accountPassword = values?.accountPassword;

        if (!accountEmail && !accountPassword) {
            return true;
        }

        if (!accountEmail) {
            return this.createError({
                path: "accountEmail",
                message: "Informe o e-mail para criar a conta do aluno.",
            });
        }

        if (!accountPassword?.trim()) {
            return this.createError({
                path: "accountPassword",
                message: "Informe a senha para criar a conta do aluno.",
            });
        }

        return true;
    }
);
