import InputMask from "@mona-health/react-input-mask";
import { Field, FieldLabel } from "../ui/field";
import { useField } from "formik";
import { InputGroup, InputGroupAddon } from "../ui/input-group";
import { Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CpfInputProps {
  name: string;
  hasLabel?: boolean;
  placeholder?: string;
  label?: string;
  isFilter?: boolean;
}

export default function CpfInput({...props}: CpfInputProps) {
  const [field] = useField(props.name);
  const [isFocused, setIsFocused] = useState(false);

  return props.isFilter ? (
    <InputGroup className={cn("w-full rounded-xl border border-border bg-filter-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground",
      isFocused && "outline-none ring-2 ring-ring/20"
    )}>
      <InputMask
        {...field}
        mask="999.999.999-99"
        placeholder={props.placeholder}
        data-slot="input-group-control"
        className="w-full h-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>
    </InputGroup>
  ) : (
    <Field>
          {props.hasLabel ? <FieldLabel>CPF</FieldLabel> : null}
          <InputMask 
            mask="999.999.999-99"
            {...field}
            placeholder={props.placeholder}
            label={props.label}
            className="w-full h-8 rounded-xl border border-border bg-filter-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
    </Field>
  )
};
