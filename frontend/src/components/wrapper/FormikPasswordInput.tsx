import { useField } from "formik";
import { Input } from "@/components/ui/input";

interface FormikPasswordInputProps {
    name: string;
    placeholder?: string;
}
//mensagem de erro caso a senha seja menor que 3 dígitos
export function FormikPasswordInput({ name, placeholder }: FormikPasswordInputProps) {
    const [field, meta] = useField(name);

    return (
        <div>
            <Input
                type="password"
                placeholder={placeholder}
                {...field}
            />
            {meta.touched && meta.error && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                    {meta.error}
                </p>
            )}
        </div>
    );
}
