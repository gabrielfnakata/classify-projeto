import { useNavigate } from "react-router";
import { Formik, Form } from "formik";
import { FormikInput } from "@/components/formik-input/FormikInput";
import { FormikSelectField } from "@/components/formik-input/FormikSelect";
import { ContentCard } from "@/components/layout/content-card";
import { Button } from "@/components/ui/button";
import PhoneInput from "@/components/phone-input/PhoneInput";
import { RegisterStudentsValidationSchema } from "@/validation/RegisterStudentsSchema";
import type { FormikHelpers } from "formik";
import { type RegisterStudentsForm } from "@/shared/models/forms/registerStudentsForm";
import { FieldLabel } from "@/components/ui/field";

// TODO: passar isso pro backend
const serieOptions = [
  { label: "1º Ano", value: "1" },
  { label: "2º Ano", value: "2" },
  { label: "3º Ano", value: "3" },
  { label: "4º Ano", value: "4" },
  { label: "5º Ano", value: "5" },
  { label: "6º Ano", value: "6" },
  { label: "7º Ano", value: "7" },
  { label: "8º Ano", value: "8" },
  { label: "9º Ano", value: "9" },
];

// TODO: trocar por true e false
const referralOptions = [
  { label: "Sim", value: "sim" },
  { label: "Não", value: "nao" },
];

const initialValues: RegisterStudentsForm = {
  fullName: "",
  guardian1Name: "",
  parentage1: "",
  guardian2Name: "",
  parentage2: "",
  guardian1Phone: "",
  guardian2Phone: "",
  email: "",
  address: "",
  neighborhood: "",
  school: "",
  grade: "",
  referral: "",
  referrerName: "",
};

function SelectWrapper({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel>
        {label}
        {required}
      </FieldLabel>
      {children}
    </div>
  );
}

export default function RegisterStudents() {
  const navigate = useNavigate();

  const handleSubmit = async (
    values: RegisterStudentsForm,
    helpers: FormikHelpers<RegisterStudentsForm>
  ) => {
    try {
      // TODO: integrar com api
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate("/students");
    } catch (error) {
      alert("Ocorreu um erro ao cadastrar. Tente novamente mais tarde.");
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <div className="background w-full h-full flex flex-col items-center justify-center">
      <ContentCard className="card rounded-2xl w-full max-w-5xl flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-6">Registrar Aluno</h1>

        <Formik
          initialValues={initialValues}
          validationSchema={RegisterStudentsValidationSchema}
          onSubmit={handleSubmit}
          validateOnMount={true}
        >
          {({ isSubmitting, values, errors, touched, setFieldValue, setTouched }) => (
            <Form className="flex flex-col gap-5 w-full">

              <FormikInput name="fullName" label="Nome Completo" required placeholder="Ex: Maria da Silva" />

              <div className="grid grid-cols-2 gap-4">
                <FormikInput name="guardian1Name" label="Nome do Responsável 1" required placeholder="Ex: Ana da Silva" />
                <FormikInput name="parentage1" label="Parentesco" required placeholder="Ex: Mãe" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormikInput name="guardian2Name" label="Nome do Responsável 2" placeholder="Ex: João da Silva" />
                <FormikInput name="parentage2" label="Parentesco" placeholder="Ex: Pai" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PhoneInput name="guardian1Phone" label="Telefone do Responsável 1" required placeholder="Ex: (11) 99234-1234" />
                <PhoneInput name="guardian2Phone" label="Telefone do Responsável 2" placeholder="Ex: (11) 99234-1234" />
              </div>

              <div className="flex flex-col gap-1">
                <FormikInput name="email" label="E-mail" required type="text" placeholder="Ex: ana@email.com" />
                {touched.email && errors.email && errors.email !== "E-mail é obrigatório" && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormikInput name="address" label="Endereço" required placeholder="Ex: Rua Pedro Vicente, 123 - Ap 101" />
                <FormikInput name="neighborhood" label="Bairro" required placeholder="Ex: Canindé" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormikInput name="school" label="Escola" required placeholder="Ex: Colégio Aprender Mais" />
                <SelectWrapper label="Série" required>
                  <FormikSelectField
                    name="grade"
                    options={serieOptions}
                    placeholder="Escolha uma série"
                    required
                  />
                </SelectWrapper>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectWrapper label="Indicação">
                  <FormikSelectField
                    name="referral"
                    options={referralOptions}
                    placeholder="Escolha uma opção"
                    onValueChange={(value) => {
                      if (value !== "sim") setFieldValue("referrerName", "");
                    }}
                  />
                </SelectWrapper>
                <FormikInput
                  name="referrerName"
                  label="Se sim, quem indicou"
                  placeholder="Ex: Carolina Santos (Amiga)"
                  disabled={values.referral !== "sim"}
                />
              </div>

              <div className="flex justify-end pt-6 gap-4">
                <Button
                  type="button"
                  onClick={() => navigate("/students")}
                  className="bg-[#c0392b] text-[#f1f1f1] p-1 rounded-sm border-none w-[5vw] h-[4vh] shadow-[0_4px_4px_-4px_#707070]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#119D96] text-[#f1f1f1] p-1 rounded-sm border-none w-[5vw] h-[4vh] shadow-[0_4px_4px_-4px_#707070]"
                  disabled={isSubmitting}
                  onClick={async () => {
                    const allTouched = Object.keys(initialValues).reduce(
                      (acc, key) => ({ ...acc, [key]: true }),
                      {}
                    );
                    await setTouched(allTouched);
                  }}
                >
                  Enviar
                </Button>
              </div>

            </Form>
          )}
        </Formik>
      </ContentCard>
    </div>
  );
}