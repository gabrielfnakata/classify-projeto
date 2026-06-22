import * as yup from "yup";

export const NewEmployeeValidationSchema = yup.object({
    name: yup.string().required("O nome é obrigatório"),
    birthDate: yup.string().required("A data de nascimento é obrigatória"),
    cpf: yup.string().required("O CPF é obrigatório"),
    hireDate: yup.string().required("A data de contratação é obrigatória"),
    email: yup.string().email("E-mail inválido").required("O e-mail é obrigatório"),
    roleId: yup.string().required("O cargo é obrigatório"),
    telephone1: yup.string().required("O telefone é obrigatório"),
    telephone2: yup.string().notRequired()
});
