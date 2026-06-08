import InputMask from "@mona-health/react-input-mask";
import { Field, FieldLabel } from "../ui/field";
import { useField } from "formik";

interface PhoneInputProps {
  name: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export default function PhoneInput({ name, ...props }: PhoneInputProps) {
  const [field, meta] = useField(name);
  const error = props.error ?? (meta.touched && meta.error ? meta.error : undefined);

  return (
    <Field>
      {props.label && <FieldLabel>{props.label}</FieldLabel>}
      <InputMask
        mask={field.value ? "(99) 99999-9999" : ""}
        {...field}
        placeholder={props.placeholder}
        required={props.required}
        disabled={props.disabled}
        className={`w-full h-8 rounded-xl border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 ${
          props.disabled
            ? "bg-filter-surface opacity-50 cursor-not-allowed"
            : "bg-filter-surface"
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </Field>
  );
}