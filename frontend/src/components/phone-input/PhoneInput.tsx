import InputMask from "@mona-health/react-input-mask";
import {Field, FieldError, FieldLabel} from "../ui/field";
import { useField } from "formik";
import {cn} from "@/lib/utils.ts";

interface PhoneInputProps {
  name: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function PhoneInput({...props}: PhoneInputProps) {
  const [field, meta] = useField(props.name);
  const showError = meta.touched && !!meta.error;

  return (
    <Field className="relative" data-invalid={showError}>
      {props.label ? <FieldLabel>{props.label}</FieldLabel> : null}
      <InputMask
        id={props.name}
        mask="(99) 99999-9999"
        {...field}
        placeholder={props.placeholder}
        label={props.label}
        aria-invalid={showError}
        className={cn(
            "w-full h-8 rounded-xl border border-border bg-filter-surface px-3 py-2 text-sm text-foreground " +
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20",
            showError && "border-destructive focus:ring-destructive/20")}
      />
      {showError && (
          <FieldError className="absolute top-full left-0 mt-1 text-xs leading-4">
            {meta.error}
          </FieldError>
      )}
    </Field>
  )
};
