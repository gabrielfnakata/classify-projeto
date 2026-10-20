import { useFormikContext } from "formik";
import { Check, X } from "lucide-react";

import { FormikInput } from "@/components/formik-input/FormikInput";
import { PasswordRequirements } from "@/components/profile/PasswordRequirements";
import { cn } from "@/lib/utils";

interface NewPasswordValues {
  password: string;
  confirmPassword: string;
}

export function NewPasswordFields() {
  const { values, touched } = useFormikContext<NewPasswordValues>();
  const passwordsMatch = values.confirmPassword.length > 0 && values.password === values.confirmPassword;

  return (
    <>
      <div className="flex flex-col gap-2">
        <FormikInput name="password" label="Nova senha" placeholder="Crie sua senha" type="password" />
        <PasswordRequirements password={values.password} touched={Boolean(touched.password)} className="pt-1" />
      </div>

      <div className="flex flex-col gap-2">
        <FormikInput name="confirmPassword" label="Repita a senha" placeholder="Digite a senha novamente" type="password" />
        {values.confirmPassword.length > 0 && (
          <p className={cn(
            "flex items-center gap-1.5 pt-1 text-xs",
            passwordsMatch ? "text-success-foreground" : "text-destructive"
          )}>
            {passwordsMatch ? <Check className="size-3.5" /> : <X className="size-3.5" />}
            {passwordsMatch ? "As senhas coincidem" : "As senhas não coincidem"}
          </p>
        )}
      </div>
    </>
  );
}
