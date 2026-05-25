import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { Field as UIField } from "@/components/ui/field";
import { Form, Formik, type FormikHelpers } from "formik";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { FormikInput } from "@/components/formik-input/FormikInput";
import { LoginValidationSchema } from "@/validation/LoginSchema";
import { useEffect } from "react";
import { ContentCard } from "@/components/layout/content-card";
import CpfInput from "@/components/cpf-input/CpfInput";
import type { LoginForm } from "@/shared/models/forms/loginForm";

export default function Login() {
    const { login, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (values: LoginForm, helpers: FormikHelpers<LoginForm>) => {
        await login(values)
        .then(() => navigate('/classes'))
        .catch(() => alert("Ocorreu um erro ao logar. Tente novamente mais tarde."))
        .finally(() => helpers.setSubmitting(false));
    }

    useEffect(() => {
        logout();
    }, [])

    return (
        <div className="background w-screen h-screen flex flex-col items-center justify-center">
            <ContentCard className="card rounded-2xl w-[36.5vw] h-[64vh] g-[4vh] flex flex-col items-center justify-center">
                <img className="w-[11.5vw] h-[16vh] mb-[5vh]" src="/react.svg" />
                <Formik
                    initialValues={{cpf: "", password: "", rememberMe: false}}
                    validationSchema={LoginValidationSchema}
                    onSubmit={(values: LoginForm, helpers: FormikHelpers<LoginForm>) => {
                        handleLogin(values, helpers)
                    }}
                    validateOnMount={true}
                >
                    {({isSubmitting, isValid, setFieldValue, values}) => (
                        <Form className="flex flex-col gap-[1.5vh] items-center justify-evenly">
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
                            <div className="w-[20vw] flex flex-row items-center justify-between">
                                <FieldGroup className="w-[36%]">
                                    <UIField orientation="horizontal">
                                        <Checkbox 
                                          className="bg-[#D9D9D9] dark:bg-[#f1f1f1] data-checked:bg-[#f1f1f1] dark:data-checked:bg-[#f1f1f1] data-checked:text-[#119E96]"
                                          checked={values.rememberMe}
                                          onCheckedChange={(checked) => setFieldValue("rememberMe", checked)}
                                        />
                                        <FieldLabel className="text-xs"> Lembrar de mim </FieldLabel>
                                    </UIField>
                                </FieldGroup>
                                <p className="text-xs text-[#0AA660] hover:cursor-pointer" onClick={() => {navigate('/forgot-password')}}>
                                    Esqueci minha senha
                                </p>
                            </div>
                            <Button className="btn" type="submit" disabled={!isValid || isSubmitting}>Entrar</Button>
                            <Button className="btn" type="button" onClick={() => navigate('/signup')}>Cadastro</Button>
                        </Form>
                    )}
                </Formik>
            </ContentCard>
        </div>
    );
}