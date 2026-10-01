import * as yup from "yup";

export const NewEmployeeValidationSchema = yup.object({
    name: yup.string().required("O nome é obrigatório"),
    birthDate: yup.date()
        .required("A data de nascimento é obrigatória")
        .max(new Date(), "A data de nascimento não pode ser uma data futura.")
        .test(
            "birth-before-hire",
            "A data de nascimento deve ser anterior à data de contratação.",
            function (value) {
                const {hireDate} = this.parent;
                if (!value || !hireDate) return true;
                return value < hireDate;
            },
        ),
    cpf: yup.string().required("O CPF é obrigatório"),
    hireDate: yup.date().required("A data de contratação é obrigatória"),
    email: yup.string().email("E-mail inválido").required("O e-mail é obrigatório"),
    roleId: yup.string().required("O cargo é obrigatório"),
    telephone1: yup.string().notRequired().matches(/^\(([0-9]{2})\) ([0-9]{5})-([0-9]{4})$/, { message: "Formato inválido.", excludeEmptyString: true }),
    telephone2: yup.string().notRequired().matches(/^\(([0-9]{2})\) ([0-9]{5})-([0-9]{4})$/, { message: "Formato inválido.", excludeEmptyString: true }),
});
