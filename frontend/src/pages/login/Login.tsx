import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { Field as UIField } from "@/components/ui/field";
import { Form, Formik, type FormikHelpers } from "formik";
import "@/styles/login.css";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { FormikInput } from "@/components/wrapper/FormikInput";

interface LoginForm {
    cpf: string,
    password: string
};

export default function Login() {
    const { Login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (values: LoginForm, helpers: FormikHelpers<LoginForm>) => {
        await Login(values.cpf, values.password)
        .then(() => navigate('/home'))
        .catch(() => alert("Ocorreu um erro ao logar. Tente novamente mais tarde."))
        .finally(() => helpers.setSubmitting(false));
    }


    return (
        <div className="background">
            <div className="login-card">
                <img className="logo" src="/react.svg" />
                <Formik
                    initialValues={{cpf: "", password: ""}}
                    onSubmit={(values: LoginForm, helpers: FormikHelpers<LoginForm>) => {
                        handleLogin(values, helpers)
                    }}
                >
                    {({isSubmitting, isValid}) => (
                        <Form className="form">
                            <FormikInput
                                name="cpf"
                                placeholder="CPF"
                            />
                            <FormikInput
                                name="password"
                                placeholder="Senha"
                                type="password"
                            />
                            <div className="check-row">
                                <FieldGroup className="check-wrapper">
                                    <UIField orientation="horizontal">
                                        <Checkbox className="checkbox" defaultChecked></Checkbox>
                                        <FieldLabel> Lembrar de mim </FieldLabel>
                                    </UIField>
                                </FieldGroup>
                                <p className="forgot-password" onClick={() => {navigate('/forgot-password')}}>
                                    Esqueci minha senha
                                </p>
                            </div>
                            <Button className="btn" type="submit" disabled={!isValid || isSubmitting}>Entrar</Button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}