import { useState } from "react";
import { Form, Formik, type FormikHelpers } from "formik";
import { useNavigate, useSearchParams } from "react-router";

import { FormikInput } from "@/components/formik-input/FormikInput";
import { AuthCard, AuthError } from "@/components/layout/auth-card";
import { NewPasswordFields } from "@/components/profile/NewPasswordFields";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import type LoginResponseDTO from "@/shared/dtos/auth/LoginResponseDTO";
import { apiErrorMessage } from "@/shared/utils/api-error";
import { homeRouteFor } from "@/shared/utils/home-route";
import { FirstAccessValidationSchema } from "@/validation/PasswordAccessSchema";

interface FirstAccessForm {
    email: string;
    password: string;
    confirmPassword: string;
}

export default function FirstAccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { loginWithTokens } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (values: FirstAccessForm, helpers: FormikHelpers<FirstAccessForm>) => {
        setError(null);
        try {
            const { data } = await api.post<LoginResponseDTO>(
                "/auth/first-access",
                { email: values.email.trim(), password: values.password, confirmPassword: values.confirmPassword },
                { skipExceptionModal: true }
            );
            const user = loginWithTokens(data, true);
            navigate(homeRouteFor(user.role), { replace: true });
        } catch (err) {
            setError(apiErrorMessage(err, "Não foi possível criar sua senha. Tente novamente."));
        } finally {
            helpers.setSubmitting(false);
        }
    };

    return (
        <AuthCard title="Primeiro acesso" description="Informe o e-mail do seu cadastro e crie sua senha.">
            <Formik<FirstAccessForm>
                initialValues={{ email: searchParams.get("email") ?? "", password: "", confirmPassword: "" }}
                validationSchema={FirstAccessValidationSchema}
                onSubmit={handleSubmit}
                validateOnMount
            >
                {({ isSubmitting, isValid }) => (
                    <Form className="flex flex-col gap-6">
                        {error && <AuthError message={error} />}

                        <FormikInput name="email" label="E-mail cadastrado" placeholder="seu@email.com" type="text" />
                        <NewPasswordFields />

                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                type="submit"
                                className="h-[4vh] min-h-9 rounded-sm bg-[#119D96] text-[#f1f1f1] shadow-[0_4px_4px_-4px_#707070]"
                                disabled={!isValid || isSubmitting}
                            >
                                {isSubmitting ? "Salvando..." : "Criar senha e entrar"}
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
