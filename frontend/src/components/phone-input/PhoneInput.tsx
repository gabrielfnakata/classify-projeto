import InputMask from "@mona-health/react-input-mask";
import { Field, FieldLabel } from "../ui/field";
import { useField } from "formik";

interface PhoneInputProps {
  name: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
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
        className="w-full h-8 rounded-xl border border-border bg-filter-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </Field>
  );
}