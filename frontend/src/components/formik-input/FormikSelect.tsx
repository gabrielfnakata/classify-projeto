import { useField } from "formik";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {cn} from "@/lib/utils.ts";
interface FormikSelectFieldProps {
    name: string;
    label?: string;
    placeholder?: string;
    options: { label: string; value: string }[];
}

export function FormikSelectField({ 
    name,
    label,
    options,
    placeholder,
}: FormikSelectFieldProps) {
    const [field, meta, helpers] = useField(name);
    const showError = meta.touched && !!meta.error;
    return (
        <FieldGroup>
            <Field className="relative" data-invalid={showError}>
                {label ? <FieldLabel>{label}</FieldLabel> : null}
                <Select
                    value={field.value}
                    onValueChange={(value) => helpers.setValue(value)}
                    onOpenChange={(open) => { if (!open) helpers.setTouched(true) }}
                >
                    <SelectTrigger
                        aria-invalid={showError}
                        className={cn(
                            "flex h-8 w-full items-center justify-between rounded-xl border border-border bg-filter-surface px-3 text-sm text-foreground transition-colors",
                            showError && "border-destructive"
                        )}
                    >
                        <SelectValue placeholder={placeholder}/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {options.map((option) => {
                                return (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                )
                            })}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            {showError && (
                <FieldError className="absolute top-full left-0 mt-1 text-xs leading-4">
                    {meta.error}
                </FieldError>
            )}
            </Field>
        </FieldGroup>
    );
}
