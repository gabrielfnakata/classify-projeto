import * as yup from "yup";

export const StudentTelephoneValidationSchema = yup.object({
    telephone: yup.string()
        .transform((value?: string) => (value && /\d/.test(value) ? value : ""))
        .required("O telefone é obrigatório")
        .matches(/^\(([0-9]{2})\) ([0-9]{5})-([0-9]{4})$/, "Formato inválido."),
});
