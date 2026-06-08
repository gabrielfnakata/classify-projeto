import { useField } from "formik";
import { Input } from "../ui/input";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";

interface FormikInputProps {
    name: string;
    label?: string;
    type?: "text" | "password" | "number" | "date";
    className?: string;
    placeholder?: string;
    error?: string;
    required?: boolean;
    isFilter?: boolean;
    mask?: string;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormikInput({ name, ...props }: FormikInputProps) {
    const [field] = useField(name);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        field.onChange(e);
        props.onChange?.(e);
    };

    return props.isFilter
    ? (
        <InputGroup className="w-full rounded-xl border border-border bg-filter-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
            <InputGroupInput
                name={field.name}
                onChange={handleChange}
                value={field.value}
                type={props.type}
                placeholder={props.placeholder}
                required={props.required}
            />
            <InputGroupAddon align="inline-start">
                <Search/>
            </InputGroupAddon>
        </InputGroup>
    ) :
    (
        <FieldGroup>
            <Field className={`${props.className}`}>
                {props.label ? <FieldLabel>{props.label}</FieldLabel> : null}
                <Input
                    name={field.name}
                    onChange={handleChange}
                    value={field.value}
                    type={props.type}
                    placeholder={props.placeholder}
                    required={props.required}
                    disabled={props.disabled}
                    className="w-full rounded-xl border border-border bg-filter-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
            </Field>
        </FieldGroup>
    );
}