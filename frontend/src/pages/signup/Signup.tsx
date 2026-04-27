import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Form, Formik, type FormikHelpers } from "formik";
import { FormikCPFInput } from "@/components/wrapper/FormikCPFInput";
import { FormikPasswordInput } from "@/components/wrapper/FormikPasswordInput";
import { SignupValidationSchema } from "@/validation/SignupSchema";
import "@/styles/login.css";

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
        <div className="background">
            <div className="login-card">
                <img className="logo" src="/classify-logo.svg" />
                <Formik
                    initialValues={{ cpf: "", password: "", confirmPassword: "" }}
                    validationSchema={SignupValidationSchema}
                    onSubmit={(values: SignupForm, helpers: FormikHelpers<SignupForm>) => {
                        handleSignup(values, helpers);
                    }}
                >
                    {({ isSubmitting, isValid }) => (
                        <Form className="form">
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
                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                                <Button
                                    className="btn"
                                    type="submit"
                                    disabled={!isValid || isSubmitting}
                                >
                                    Criar
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
