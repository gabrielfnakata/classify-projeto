import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import "@/styles/login.css";

export default function Login() {
    const { signed, Login } = useAuth();

    return (
        <div className="background">
            <div className="login-card">
                <img className="logo" src="./public/react.svg" />
                <div className="form">
                    <Input 
                    placeholder="E-mail"
                    />
                    <Input
                    placeholder="Senha"
                    type="password"
                    />
                    <div className="check-row">
                        <FieldGroup className="check-wrapper">
                            <Field orientation="horizontal">
                                <Checkbox className="checkbox" defaultChecked></Checkbox>
                                <FieldLabel> Lembrar de mim </FieldLabel>
                            </Field>
                        </FieldGroup>
                        <a>
                            Esqueci minha senha
                        </a>
                    </div>
                    <button className="btn" onClick={() => {}}>Entrar</button>
                </div>
            </div>
        </div>
    );
}