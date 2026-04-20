import { useField } from "formik";
import { Input } from "@/components/ui/input";

interface FormikInputProps {
    name: string;
    placeholder?: string;
    type?: string;
}

export function FormikInput({ name, ...props }: FormikInputProps) {
    const [field] = useField(name);
    return <Input {...field} {...props} />;
}