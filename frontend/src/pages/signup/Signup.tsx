import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Form, Formik, type FormikHelpers } from "formik";
import { SignupValidationSchema } from "@/validation/SignupSchema";
import { ContentCard } from "@/components/layout/content-card";
import CpfInput from "@/components/cpf-input/CpfInput";
import { FormikInput } from "@/components/formik-input/FormikInput";

interface SignupForm {
    cpf: string;
    password: string;
    confirmPassword: string;
}

export default function Signup() {
    const navigate = useNavigate();

    const handleSignup = async (values: SignupForm, helpers: FormikHelpers<SignupForm>) => {
        try {
            console.log("Cadastro:", values);
            alert("Cadastro realizado com sucesso!");
            navigate('/');
        } catch (error) {
            alert("Ocorreu um erro ao cadastrar. Tente novamente mais tarde.");
        } finally {
            helpers.setSubmitting(false);
        }
    }

    return (
        <div className="background w-screen h-screen flex flex-col items-center justify-center">
            <ContentCard className="card rounded-2xl w-[36.5vw] h-[64vh] g-[4vh] flex flex-col items-center justify-center">
                <img className="w-[11.5vw] h-[16vh] mb-[5vh]" src="/react.svg" />
                <Formik
                    initialValues={{ cpf: "", password: "", confirmPassword: "" }}
                    validationSchema={SignupValidationSchema}
                    onSubmit={(values: SignupForm, helpers: FormikHelpers<SignupForm>) => {
                        handleSignup(values, helpers);
                    }}
                    validateOnMount={true}
                >
                    {({ isSubmitting, isValid }) => (
                        <Form className="flex flex-col gap-[1.5vh] items-center justify-evenly w-[20vw]">
                            <CpfInput
                                name="cpf"
                                label="CPF"
                                placeholder="XXX.XXX.XXX-XX"
                                hasLabel={true}
                            />
                            <FormikInput
                                name="password"
                                placeholder="Senha"
                                label="Senha"
                                type="password"
                            />
                            <FormikInput
                                name="confirmPassword"
                                placeholder="Confirmar Senha"
                                label="Confirmar Senha"
                                type="password"
                            />
                            <Button className="bg-[#119D96] disabled:border-t-green-200 text-[#f1f1f1] p-1 rounded-sm border-none w-[20vw] h-[4vh] shadow-[0_4px_4px_-4px_#707070]" type="submit" disabled={!isValid || isSubmitting}>Criar</Button>
                            <Button className="bg-[#119D96] disabled:border-t-green-200 text-[#f1f1f1] p-1 rounded-sm border-none w-[20vw] h-[4vh] shadow-[0_4px_4px_-4px_#707070]" type="button" onClick={() => navigate('/login')}>Voltar para Login</Button>
                        </Form>
                    )}
                </Formik>
            </ContentCard>
        </div>
    );
}
