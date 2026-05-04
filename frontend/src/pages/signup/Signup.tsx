import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Form, Formik, type FormikHelpers } from "formik";
import { FormikCPFInput } from "@/components/wrapper/FormikCPFInput";
import { FormikPasswordInput } from "@/components/wrapper/FormikPasswordInput";
import { SignupValidationSchema } from "@/validation/SignupSchema";

interface SignupForm {
    cpf: string;
    password: string;
    confirmPassword: string;
}

export default function Signup() {
    const navigate = useNavigate();

    const handleSignup = async (values: SignupForm, helpers: FormikHelpers<SignupForm>) => {
        try {
            // lógica de cadastro
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
        <div className="bg-[#88c3c03b] w-screen h-screen flex flex-col items-center justify-center">
            <div className="bg-white rounded-2xl w-[36.5vw] h-[64vh] gap-[4vh] flex flex-col items-center justify-center">
                <img className="w-[11.5vw] h-[16vh] mb-[5vh]" src="/classify-logo.svg" />
                <Formik
                    initialValues={{ cpf: "", password: "", confirmPassword: "" }}
                    validationSchema={SignupValidationSchema}
                    onSubmit={(values: SignupForm, helpers: FormikHelpers<SignupForm>) => {
                        handleSignup(values, helpers);
                    }}
                >
                    {({ isSubmitting, isValid }) => (
                        <Form className="flex flex-col gap-[1.5vh] items-center justify-evenly w-[25vw]">
                            <FormikCPFInput
                                name="cpf"
                                placeholder="CPF"
                            />
                            <FormikPasswordInput
                                name="password"
                                placeholder="Senha"
                            />
                            <FormikPasswordInput
                                name="confirmPassword"
                                placeholder="Confirmar Senha"
                            />
                            <Button
                                className="bg-[#119D96] disabled:border-t-green-200 text-[#f1f1f1] p-1 rounded-sm border-none w-full h-[4vh] shadow-[0_4px_4px_-4px_#707070]"
                                type="submit"
                                disabled={!isValid || isSubmitting}
                            >
                                Criar
                            </Button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
