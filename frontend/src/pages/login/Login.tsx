import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { Field as UIField } from "@/components/ui/field";
import { Form, Formik, type FormikHelpers } from "formik";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { FormikInput } from "@/components/formik-input/FormikInput";
import { LoginValidationSchema } from "@/validation/LoginSchema";
import { useEffect, useState } from "react";
import { ContentCard } from "@/components/layout/content-card";
import type { LoginForm } from "@/shared/models/forms/loginForm";

export default function Login() {
    const { login, logout } = useAuth();
    const navigate = useNavigate();
    const [erroLogin, setErroLogin] = useState<string | null>(null);

    const handleLogin = async (values: LoginForm, helpers: FormikHelpers<LoginForm>) => {
        setErroLogin(null);
        await login(values)
        .then(() => navigate('/classes'))
        .catch((err) => {
            const mensagem = err?.response?.data?.mensagem ?? err?.message ?? "E-mail ou senha inválidos.";
            setErroLogin(mensagem);
        })
        .finally(() => helpers.setSubmitting(false));
    }

    useEffect(() => {
        logout();
    }, [])

    return (
        <div className="background w-screen h-screen flex flex-col items-center justify-center">
            <ContentCard className="card rounded-2xl w-[36.5vw] h-[64vh] g-[4vh] flex flex-col items-center justify-center">
                <img className="w-[25vw] h-[12vh] mb-[5vh]" src="/light logo.svg" />
                <Formik
                    initialValues={{email: "", password: "", rememberMe: false}}
                    validationSchema={LoginValidationSchema}
                    onSubmit={(values: LoginForm, helpers: FormikHelpers<LoginForm>) => {
                        handleLogin(values, helpers)
                    }}
                    validateOnMount={true}
                >
                    {({isSubmitting, isValid, setFieldValue, values}) => (
                        <Form className="flex flex-col gap-[1.5vh] items-center justify-evenly">
                            {erroLogin && (
                                <div className="w-[20vw] rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                                    <p className="leading-relaxed">{erroLogin}</p>
                                </div>
                            )}

                            <FormikInput 
                                name="email"
                                placeholder="Email"
                                label="Email"
                                type="text"
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
                            <Button className="bg-[#119D96] disabled:border-t-green-200 text-[#f1f1f1] p-1 rounded-sm border-none w-[20vw] h-[4vh] shadow-[0_4px_4px_-4px_#707070]" type="submit" disabled={!isValid || isSubmitting}>Entrar</Button>
                        </Form>
                    )}
                </Formik>
            </ContentCard>
        </div>
    );
}