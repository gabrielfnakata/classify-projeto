import { useField } from "formik";
import { Input } from "@/components/ui/input";

interface FormikInputProps {
    name: string;
    className?: string;
    placeholder?: string;
    type?: string;
    label?: string;
    error?: string;
}

export function FormikInput({ name, ...props }: FormikInputProps) {
    const [field] = useField(name);
    return <Input {...field} {...props} />;
}