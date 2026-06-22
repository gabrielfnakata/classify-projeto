import InputMask from "@mona-health/react-input-mask";
import { Field, FieldLabel } from "../ui/field";
import { useField } from "formik";

interface PhoneInputProps {
  name: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function PhoneInput({...props}: PhoneInputProps) {
  const [field] = useField(props.name);

  return (
    <Field>
      {props.label ? <FieldLabel>{props.label}</FieldLabel> : null}
      <InputMask
        mask="(99) 99999-9999"
        {...field}
        placeholder={props.placeholder}
        label={props.label}
        className="w-full h-8 rounded-xl border border-border bg-filter-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
      />
    </Field>
  )
};
