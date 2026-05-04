import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { Field as UIField } from "@/components/ui/field";
import { Form, Formik, type FormikHelpers } from "formik";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { FormikInput } from "@/components/wrapper/FormikInput";
import { LoginValidationSchema } from "@/validation/LoginSchema";

interface LoginForm {
    cpf: string,
    password: string
};

export default function Login() {
    const { Login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (values: LoginForm, helpers: FormikHelpers<LoginForm>) => {
        await Login(values.cpf, values.password)
        .then(() => navigate('/classes'))
        .catch(() => alert("Ocorreu um erro ao logar. Tente novamente mais tarde."))
        .finally(() => helpers.setSubmitting(false));
    }


    return (
        <div className="bg-[#88c3c03b] w-screen h-screen flex flex-col items-center justify-center">
            <div className="bg-white rounded-2xl w-[36.5vw] h-[64vh] g-[4vh] flex flex-col items-center justify-center">
                <img className="w-[11.5vw] h-[16vh] mb-[5vh]" src="/react.svg" />
                <Formik
                    initialValues={{cpf: "", password: ""}}
                    validationSchema={LoginValidationSchema}
                    onSubmit={(values: LoginForm, helpers: FormikHelpers<LoginForm>) => {
                        handleLogin(values, helpers)
                    }}
                >
                    {({isSubmitting, isValid}) => (
                        <Form className="flex flex-col gap-[1.5vh] items-center justify-evenly">
                            <FormikInput
                                name="cpf"
                                placeholder="CPF"
                                className="w-[20vw] h-[3vh] text-xs text-black p-1 rounded-sm bg-[#f1f1f1] dark:bg-[#f1f1f1] border-t border-t-solid border-t-[#119E96] border-b border-b-solid border-b-[#838383] border-x-0"
                                />
                            <FormikInput
                                name="password"
                                placeholder="Senha"
                                type="password"
                                className="w-[20vw] h-[3vh] text-xs text-black p-1 rounded-sm bg-[#f1f1f1] dark:bg-[#f1f1f1] border-t border-t-solid border-t-[#119E96] border-b border-b-solid border-b-[#838383] border-x-0"
                            />
                            <div className="w-[20vw] flex flex-row items-center justify-between">
                                <FieldGroup className="w-[36%]">
                                    <UIField orientation="horizontal">
                                        <Checkbox className="bg-[#D9D9D9] dark:bg-[#f1f1f1] data-checked:bg-[#f1f1f1] dark:data-checked:bg-[#f1f1f1] data-checked:text-[#119E96]"></Checkbox>
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
            </div>
        </div>
    );
}