import { useState } from "react";
import { Form, Formik, type FormikHelpers } from "formik";
import { MailCheck } from "lucide-react";
import { useNavigate } from "react-router";

import { FormikInput } from "@/components/formik-input/FormikInput";
import { AuthCard, AuthError } from "@/components/layout/auth-card";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { apiErrorMessage } from "@/shared/utils/api-error";
import { ForgotPasswordValidationSchema } from "@/validation/PasswordAccessSchema";

interface ForgotPasswordForm {
    email: string;
}

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [sentTo, setSentTo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (values: ForgotPasswordForm, helpers: FormikHelpers<ForgotPasswordForm>) => {
        setError(null);
        try {
            await api.post("/auth/forgot-password", { email: values.email.trim() }, { skipExceptionModal: true });
            setSentTo(values.email.trim());
        } catch (err) {
            setError(apiErrorMessage(err, "Não foi possível enviar o link agora. Tente novamente."));
        } finally {
            helpers.setSubmitting(false);
        }
    };

    if (sentTo) {
        return (
            <AuthCard title="Verifique seu e-mail" description="Se houver um cadastro com esse e-mail, você vai receber o link.">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                        <MailCheck className="size-7 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Enviamos as instruções para <strong className="text-foreground">{sentTo}</strong>.
                        O link vale por 30 minutos. Não achou? Confira a caixa de spam.
                    </p>
                    <div className="flex w-full flex-col gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setSentTo(null)}>
                            Enviar de novo
                        </Button>
                        <Button type="button" variant="ghost" className="text-sm" onClick={() => navigate("/login")}>
                            Voltar para o login
                        </Button>
                    </div>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard title="Esqueci minha senha" description="Informe o e-mail do seu cadastro e enviaremos um link para criar uma nova senha.">
            <Formik<ForgotPasswordForm>
                initialValues={{ email: "" }}
                validationSchema={ForgotPasswordValidationSchema}
                onSubmit={handleSubmit}
                validateOnMount
            >
                {({ isSubmitting, isValid }) => (
                    <Form className="flex flex-col gap-6">
                        {error && <AuthError message={error} />}

                        <FormikInput name="email" label="E-mail cadastrado" placeholder="seu@email.com" type="text" />

                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                type="submit"
                                className="h-[4vh] min-h-9 rounded-sm shadow-[0_4px_4px_-4px_#707070]"
                                disabled={!isValid || isSubmitting}
                            >
                                {isSubmitting ? "Enviando..." : "Enviar link"}
                            </Button>
                            <Button type="button" variant="ghost" className="text-sm" onClick={() => navigate("/login")}>
                                Voltar para o login
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </AuthCard>
    );
}
