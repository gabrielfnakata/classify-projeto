import { useField } from "formik";
import { Input } from "../ui/input";
import {Field, FieldError, FieldGroup, FieldLabel} from "../ui/field";
import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import {cn} from "@/lib/utils.ts";

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
}

export function FormikInput({ name, ...props }: FormikInputProps) {
    const [field, meta] = useField(name);
    const showError = meta.touched && !!meta.error;
    return props.isFilter 
    ? (
        <InputGroup className="w-full rounded-xl border border-border bg-filter-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
            <InputGroupInput
                name={field.name}
                onChange={field.onChange}
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
            <Field
                className={cn("relative", props.className)}
                data-invalid={showError}
                onBlur={field.onBlur}
            >
                {props.label ? <FieldLabel>{props.label}</FieldLabel> : null}
                <Input
                    name={field.name}
                    onChange={field.onChange}
                    value={field.value}
                    type={props.type}
                    placeholder={props.placeholder}
                    required={props.required}
                    aria-invalid={showError}
                    className={cn(
                        "w-full h-8 rounded-xl border border-border bg-filter-surface px-3 py-2 text-sm text-foreground " +
                        "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20",
                        showError && "border-destructive focus:ring-destructive/20"
                    )}
                />
                {showError && (
                    <FieldError className="absolute top-full left-0 mt-1 text-xs leading-4">
                        {meta.error}
                    </FieldError>
                )}
            </Field>
        </FieldGroup>
    );
}
