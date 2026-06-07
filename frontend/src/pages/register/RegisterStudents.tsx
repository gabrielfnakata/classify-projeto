import { useNavigate } from "react-router";
import { Formik, Form } from "formik";
import { FormField } from "@/components/common/form-field";
import { SelectField } from "@/components/common/select-field";
import { ContentCard } from "@/components/layout/content-card";
import { Button } from "@/components/ui/button";
import { FormikInput } from "@/components/formik-input/FormikInput";
import PhoneInput from "@/components/phone-input/PhoneInput";
import { RegisterStudentsValidationSchema } from "@/validation/RegisterStudentsSchema";
import type { FormikHelpers } from "formik";
import { type RegisterStudentsForm } from "@/shared/models/forms/registerStudentsForm";

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

  // TODO: não precisa do formfield!
  // usar o formikselect
  // o overflow acontece pelo select do 'quem indicou'
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
          {({ isSubmitting, setFieldValue, values, errors, touched, setTouched }) => (
            <Form className="flex flex-col gap-5 w-full">

              <FormField
                label="Nome Completo"
                htmlFor="fullName"
                required
                error={touched.fullName ? errors.fullName : undefined}
              >
                <FormikInput name="fullName" placeholder="Ex: Maria da Silva" />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Nome do Responsável 1"
                  htmlFor="guardian1Name"
                  required
                  error={touched.guardian1Name ? errors.guardian1Name : undefined}
                >
                  <FormikInput name="guardian1Name" placeholder="Ex: Ana da Silva" />
                </FormField>
                <FormField
                  label="Parentesco"
                  htmlFor="parentage1"
                  required
                  error={touched.parentage1 ? errors.parentage1 : undefined}
                >
                  <FormikInput name="parentage1" placeholder="Ex: Mãe" />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Nome do Responsável 2"
                  htmlFor="guardian2Name"
                  error={touched.guardian2Name ? errors.guardian2Name : undefined}
                >
                  <FormikInput name="guardian2Name" placeholder="Ex: João da Silva" />
                </FormField>
                <FormField
                  label="Parentesco"
                  htmlFor="parentage2"
                  error={touched.parentage2 ? errors.parentage2 : undefined}
                >
                  <FormikInput name="parentage2" placeholder="Ex: Pai" />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Telefone do Responsável 1"
                  htmlFor="guardian1Phone"
                  required
                  error={touched.guardian1Phone ? errors.guardian1Phone : undefined}
                >
                  <PhoneInput name="guardian1Phone" placeholder="Ex: (11) 99234-1234" />
                </FormField>
                <FormField
                  label="Telefone do Responsável 2"
                  htmlFor="guardian2Phone"
                  error={touched.guardian2Phone ? errors.guardian2Phone : undefined}
                >
                  <PhoneInput name="guardian2Phone" placeholder="Ex: (11) 99234-1234" />
                </FormField>
              </div>

              <FormField
                label="E-mail"
                htmlFor="email"
                required
                error={touched.email ? errors.email : undefined}
              >
                <FormikInput name="email" type="text" placeholder="Ex: ana@email.com" />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Endereço"
                  htmlFor="address"
                  required
                  error={touched.address ? errors.address : undefined}
                >
                  <FormikInput name="address" placeholder="Ex: Rua Pedro Vicente, 123 - Ap 101" />
                </FormField>
                <FormField
                  label="Bairro"
                  htmlFor="neighborhood"
                  required
                  error={touched.neighborhood ? errors.neighborhood : undefined}
                >
                  <FormikInput name="neighborhood" placeholder="Ex: Canindé" />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Escola"
                  htmlFor="school"
                  required
                  error={touched.school ? errors.school : undefined}
                >
                  <FormikInput name="school" placeholder="Ex: Colégio Aprender Mais" />
                </FormField>
                <FormField
                  label="Série"
                  htmlFor="grade"
                  required
                  error={touched.grade ? errors.grade : undefined}
                >
                  <SelectField
                    value={values.grade}
                    onChange={(value) => setFieldValue("grade", value)}
                    options={serieOptions}
                    placeholder="Escolha uma série"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Indicação"
                  htmlFor="referral"
                  error={touched.referral ? errors.referral : undefined}
                >
                  <SelectField
                    value={values.referral}
                    onChange={(value) => {
                      setFieldValue("referral", value);
                      if (value === "nao") setFieldValue("referrerName", "");
                    }}
                    options={referralOptions}
                    placeholder="Escolha uma opção"
                  />
                </FormField>
                <FormField
                  label="Se sim, quem indicou"
                  htmlFor="referrerName"
                  error={touched.referrerName ? errors.referrerName : undefined}
                >
                  <FormikInput name="referrerName" placeholder="Ex: Carolina Santos (Amiga)" />
                </FormField>
              </div>

              <div className="flex justify-end pt-6 gap-4">
                <Button
                  type="button"
                  onClick={() => navigate("/students")}
                  className="bg-[#c0392b] disabled:border-t-green-200 text-[#f1f1f1] p-1 rounded-sm border-none w-[5vw] h-[4vh] shadow-[0_4px_4px_-4px_#707070]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#119D96] disabled:border-t-green-200 text-[#f1f1f1] p-1 rounded-sm border-none w-[5vw] h-[4vh] shadow-[0_4px_4px_-4px_#707070]"
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