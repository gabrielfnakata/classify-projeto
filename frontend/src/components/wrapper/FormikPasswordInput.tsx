import { useField } from "formik";
import { Input } from "@/components/ui/input";

interface FormikPasswordInputProps {
    name: string;
    placeholder?: string;
    className?: string;
}
//mensagem de erro caso a senha seja menor que 8 dígitos
export function FormikPasswordInput({ name, placeholder, className }: FormikPasswordInputProps) {
    const [field, meta] = useField(name);

    return (
        <div>
            <Input
                type="password"
                placeholder={placeholder}
                {...field}
                className={className}
            />
            {meta.touched && meta.error && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                    {meta.error}
                </p>
            )}
        </div>
    );
}
