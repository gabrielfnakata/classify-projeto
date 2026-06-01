import * as Yup from "yup";

export const RegisterStudentsValidationSchema = Yup.object({
  fullName: Yup.string().required("Nome completo é obrigatório"),
  guardian1Name: Yup.string().required("Nome do responsável 1 é obrigatório"),
  parentage1: Yup.string().required("Parentesco é obrigatório"),
  guardian1Phone: Yup.string()
    .required("Telefone do responsável 1 é obrigatório")
    .matches(
      /^\(\d{2}\) \d{5}-\d{4}$/,
      "Telefone deve ter formato válido"
    ),
  email: Yup.string()
    .required("E-mail é obrigatório")
    .email("E-mail inválido")
    .matches(/@/, "E-mail deve conter @"),
  address: Yup.string().required("Endereço é obrigatório"),
  neighborhood: Yup.string().required("Bairro é obrigatório"),
  school: Yup.string().required("Escola é obrigatória"),
  grade: Yup.string().required("Série é obrigatória"),
  guardian2Phone: Yup.string().matches(
    /^(\(\d{2}\) \d{5}-\d{4})?$/,
    "Telefone deve ter formato válido"
  ),
});
