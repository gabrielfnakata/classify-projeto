import { useNavigate } from "react-router";
import { Formik, Form } from "formik";
import { useState, useEffect } from "react";
import { FormikInput } from "@/components/formik-input/FormikInput";
import { FormikSelectField } from "@/components/formik-input/FormikSelect";
import { ContentCard } from "@/components/layout/content-card";
import { Button } from "@/components/ui/button";
import PhoneInput from "@/components/phone-input/PhoneInput";
import { RegisterStudentsValidationSchema } from "@/validation/RegisterStudentsSchema";
import type { FormikHelpers } from "formik";
import { type RegisterStudentsForm } from "@/shared/models/forms/registerStudentsForm";
import { FieldLabel } from "@/components/ui/field";
import { fetchGrades, registerStudent, type GradeOption } from "@/services/studentService";

const referralOptions = [
  { label: "Sim", value: "true" },
  { label: "Não", value: "false" },
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
  birthDate: "",
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
  const [serieOptions, setSerieOptions] = useState<GradeOption[]>([]);

  useEffect(() => {
    fetchGrades()
      .then(setSerieOptions)
      .catch(() => {
        alert("Erro ao carregar as séries. Tente novamente mais tarde.");
      });
  }, []);

  const handleSubmit = async (
    values: RegisterStudentsForm,
    helpers: FormikHelpers<RegisterStudentsForm>
  ) => {
    try {
      await registerStudent(values);
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
                <FormikInput
                  name="guardian2Name"
                  label="Nome do Responsável 2"
                  placeholder="Ex: João da Silva"
                  onChange={(e) => {
                    if (!e.target.value.trim()) {
                      setFieldValue("parentage2", "");
                      setFieldValue("guardian2Phone", "");
                    }
                  }}
                />
                <FormikInput
                  name="parentage2"
                  label="Parentesco"
                  placeholder="Ex: Pai"
                  disabled={!values.guardian2Name?.trim()}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PhoneInput name="guardian1Phone" label="Telefone do Responsável 1" required placeholder="Ex: (11) 99234-1234" />
                <PhoneInput
                  name="guardian2Phone"
                  label="Telefone do Responsável 2"
                  placeholder="Ex: (11) 99234-1234"
                  disabled={!values.guardian2Name?.trim()}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <div className="flex flex-col gap-1">
                    <FormikInput name="email" label="E-mail" required type="text" placeholder="Ex: ana@email.com" />
                    {touched.email && errors.email && errors.email !== "E-mail é obrigatório" && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
                <div className="col-span-1">
                  <FormikInput name="birthDate" label="Data de Nascimento" required type="date" />
                  {touched.birthDate && errors.birthDate && errors.birthDate !== "Data de nascimento é obrigatória" && (
                    <p className="text-xs text-red-500 mt-1">{errors.birthDate}</p>
                  )}
                </div>
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
                    placeholder={serieOptions.length === 0 ? "Carregando..." : "Escolha uma série"}
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
                      if (value !== "true") setFieldValue("referrerName", "");
                    }}
                  />
                </SelectWrapper>
                <FormikInput
                  name="referrerName"
                  label="Se sim, quem indicou"
                  placeholder="Ex: Carolina Santos (Amiga)"
                  disabled={values.referral !== "true"}
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