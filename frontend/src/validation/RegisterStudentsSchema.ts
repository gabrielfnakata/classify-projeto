import * as Yup from "yup";

export const RegisterStudentsValidationSchema = Yup.object({
  fullName: Yup.string().required("Nome completo é obrigatório"),
  guardian1Name: Yup.string().required("Nome do responsável 1 é obrigatório"),
  parentage1: Yup.string().required("Parentesco é obrigatório"),
  guardian1Phone: Yup.string()
    .matches(
      /^\(\d{2}\) \d{5}-\d{4}$/,
      "Telefone deve ter formato válido"
    ),
  email: Yup.string()
    .email("E-mail inválido")
    .matches(/@/, "E-mail deve conter @"),
  birthDate: Yup.string().required("Data de nascimento é obrigatória"),
  address: Yup.string().required("Endereço é obrigatório"),
  neighborhood: Yup.string().required("Bairro é obrigatório"),
  school: Yup.string().required("Escola é obrigatória"),
  grade: Yup.string().required("Série é obrigatória"),
  guardian2Phone: Yup.string().matches(
    /^(\(\d{2}\) \d{5}-\d{4})?$/,
    "Telefone deve ter formato válido"
  ),
});
