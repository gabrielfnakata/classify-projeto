import { useState } from "react";
import { Form, Formik, type FormikHelpers } from "formik";
import { useNavigate, useSearchParams } from "react-router";

import { AuthCard, AuthError } from "@/components/layout/auth-card";
import { NewPasswordFields } from "@/components/profile/NewPasswordFields";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import type LoginResponseDTO from "@/shared/dtos/auth/LoginResponseDTO";
import { apiErrorMessage } from "@/shared/utils/api-error";
import { homeRouteFor } from "@/shared/utils/home-route";
import { ResetPasswordValidationSchema } from "@/validation/PasswordAccessSchema";

interface ResetPasswordForm {
    password: string;
    confirmPassword: string;
}

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const { loginWithTokens } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (values: ResetPasswordForm, helpers: FormikHelpers<ResetPasswordForm>) => {
        setError(null);
        try {
            const { data } = await api.post<LoginResponseDTO>(
                "/auth/reset-password",
                { token, password: values.password, confirmPassword: values.confirmPassword },
                { skipExceptionModal: true }
            );
            const user = loginWithTokens(data, true);
            navigate(homeRouteFor(user.role), { replace: true });
        } catch (err) {
            setError(apiErrorMessage(err, "Não foi possível redefinir sua senha. Tente novamente."));
        } finally {
            helpers.setSubmitting(false);
        }
    };

    if (!token) {
        return (
            <AuthCard title="Link inválido" description="Abra o link que enviamos por e-mail, ou peça um novo.">
                <div className="flex flex-col gap-3">
                    <Button type="button" onClick={() => navigate("/forgot-password")}>Pedir um novo link</Button>
                    <Button type="button" variant="ghost" className="text-sm" onClick={() => navigate("/login")}>
                        Voltar para o login
                    </Button>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard title="Criar nova senha" description="Escolha uma senha nova para a sua conta.">
            <Formik<ResetPasswordForm>
                initialValues={{ password: "", confirmPassword: "" }}
                validationSchema={ResetPasswordValidationSchema}
                onSubmit={handleSubmit}
                validateOnMount
            >
                {({ isSubmitting, isValid }) => (
                    <Form className="flex flex-col gap-6">
                        {error && <AuthError message={error} />}

                        <NewPasswordFields />

                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                type="submit"
                                className="h-[4vh] min-h-9 rounded-sm shadow-[0_4px_4px_-4px_#707070]"
                                disabled={!isValid || isSubmitting}
                            >
                                {isSubmitting ? "Salvando..." : "Salvar senha e entrar"}
                            </Button>
                            {error && (
                                <Button type="button" variant="outline" onClick={() => navigate("/forgot-password")}>
                                    Pedir um novo link
                                </Button>
                            )}
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
