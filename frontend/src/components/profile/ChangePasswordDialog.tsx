import { useState } from "react"
import { Form, Formik, type FormikHelpers } from "formik"
import { Loader2, LockKeyhole } from "lucide-react"

import api, { type ApiExceptionPayload } from "@/services/api"
import { FormikInput } from "@/components/formik-input/FormikInput"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PasswordRequirements } from "@/components/profile/PasswordRequirements"
import { ChangePasswordValidationSchema } from "@/validation/ProfileSchema"
import type { PasswordUpdateDTO } from "@/shared/dtos/profile/PasswordUpdateDTO"

interface ChangePasswordDialogProps {
  open: boolean
  onClose: () => void
  onChanged: () => void
}

interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const initialValues: ChangePasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}

export function ChangePasswordDialog({ open, onClose, onChanged }: ChangePasswordDialogProps) {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(values: ChangePasswordForm, helpers: FormikHelpers<ChangePasswordForm>) {
    setError(null)
    const payload: PasswordUpdateDTO = {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    }

    try {
      await api.put("/employee/me/password", payload, { skipExceptionModal: true })
      helpers.resetForm()
      onChanged()
    } catch (err: unknown) {
      const e = err as { response?: { data?: ApiExceptionPayload } }
      setError(e?.response?.data?.message ?? "Não foi possível alterar a senha.")
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) return
        setError(null)
        onClose()
      }}
    >
      <DialogContent className="p-0" aria-describedby={undefined}>
        <Formik
          initialValues={initialValues}
          validationSchema={ChangePasswordValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, isValid, dirty, resetForm, values, touched, errors }) => (
            <Form>
              <DialogHeader className="border-b border-border p-5 pr-12">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <LockKeyhole className="h-4 w-4 text-primary" />
                  </div>
                  <DialogTitle>Alterar senha</DialogTitle>
                </div>
              </DialogHeader>

              <div className="flex flex-col gap-6 p-5">
                <FormikInput name="currentPassword" label="Senha atual" type="password" required />
                <div className="flex flex-col gap-2">
                  <FormikInput name="newPassword" label="Nova senha" type="password" required />
                  <PasswordRequirements
                    password={values.newPassword}
                    touched={touched.newPassword}
                    className={touched.newPassword && errors.newPassword ? "mt-4" : undefined}
                  />
                </div>
                <FormikInput name="confirmPassword" label="Confirmar nova senha" type="password" required />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    resetForm()
                    setError(null)
                    onClose()
                  }}
                >
                  Cancelar
                </Button>
                <Button className="flex-1" type="submit" disabled={isSubmitting || !isValid || !dirty}>
                  {isSubmitting && <Loader2 className="animate-spin" />}
                  Alterar senha
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
