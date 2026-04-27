import { useField } from "formik";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface FormikCPFInputProps {
    name: string;
    placeholder?: string;
}

export function FormikCPFInput({ name, placeholder }: FormikCPFInputProps) {
    const [field, meta, helpers] = useField(name);
    const [inputValue, setInputValue] = useState("");

    const formatCPF = (value: string) => {
        // remove tudo que não é número
        const cleanValue = value.replace(/\D/g, "");

        // limita a 11 dígitos
        const limitedValue = cleanValue.slice(0, 11);

        // formata no formato de XXX.XXX.XXX-XX
        let formatted = "";
        if (limitedValue.length > 0) {
            formatted = limitedValue.slice(0, 3);
            if (limitedValue.length > 3) {
                formatted += "." + limitedValue.slice(3, 6);
            }
            if (limitedValue.length > 6) {
                formatted += "." + limitedValue.slice(6, 9);
            }
            if (limitedValue.length > 9) {
                formatted += "-" + limitedValue.slice(9, 11);
            }
        }

        return formatted;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCPF(e.target.value);
        setInputValue(formatted);
        helpers.setValue(formatted);
    };

    return (
        <div>
            <Input
                type="text"
                placeholder={placeholder}
                value={field.value || inputValue}
                onChange={handleChange}
                maxLength={14}
            />
            {meta.touched && meta.error && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                    {meta.error}
                </p>
            )}
        </div>
    );
}
