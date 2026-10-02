import { useState } from "react"
import { Form, Formik, type FormikHelpers } from "formik"
import { Loader2, SquarePen } from "lucide-react"

import api, { type ApiExceptionPayload } from "@/services/api"
import { FormikInput } from "@/components/formik-input/FormikInput"
import PhoneInput from "@/components/phone-input/PhoneInput"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatTelephone } from "@/shared/utils/masks"
import { parseTelephone } from "@/shared/utils/telephone-parser"
import { ProfileValidationSchema } from "@/validation/ProfileSchema"
import type { ProfileDTO } from "@/shared/dtos/profile/ProfileDTO"
import type { ProfileUpdateDTO } from "@/shared/dtos/profile/ProfileUpdateDTO"

interface EditProfileDialogProps {
  open: boolean
  profile: ProfileDTO
  onClose: () => void
  onSaved: (profile: ProfileDTO) => void
}

interface EditProfileForm {
  name: string
  birthDate: string
  telephone: string
}

export function EditProfileDialog({ open, profile, onClose, onSaved }: EditProfileDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const hasTelephone = profile.telephones.length > 0

  const initialValues: EditProfileForm = {
    name: profile.name ?? "",
    birthDate: profile.birthDate ?? "",
    telephone: formatTelephone(profile.telephones[0]?.number),
  }

  async function handleSubmit(values: EditProfileForm, helpers: FormikHelpers<EditProfileForm>) {
    setError(null)
    const payload: ProfileUpdateDTO = {
      name: values.name,
      birthDate: values.birthDate || null,
      telephone: /\d/.test(values.telephone) ? parseTelephone(values.telephone) : null,
    }

    try {
      const { data } = await api.put<ProfileDTO>("/employee/me", payload, { skipExceptionModal: true })
      onSaved(data)
    } catch (err: unknown) {
      const e = err as { response?: { data?: ApiExceptionPayload } }
      setError(e?.response?.data?.message ?? "Não foi possível atualizar o perfil.")
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) return
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0" aria-describedby={undefined}>
        <Formik
          initialValues={initialValues}
          validationSchema={ProfileValidationSchema(hasTelephone)}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ isSubmitting, isValid, dirty }) => (
            <Form>
              <DialogHeader className="border-b border-border p-5 pr-12">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <SquarePen className="h-4 w-4 text-primary" />
                  </div>
                  <DialogTitle>Editar perfil</DialogTitle>
                </div>
              </DialogHeader>

              <div className="flex flex-col gap-6 p-5">
                <FormikInput name="name" label="Nome" required />
                <FormikInput name="birthDate" label="Data de nascimento" type="date" required />
                <PhoneInput name="telephone" label="Telefone" placeholder="(00) 00000-0000" required={hasTelephone} />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" className="flex-1" onClick={() => handleOpenChange(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" type="submit" disabled={isSubmitting || !isValid || !dirty}>
                  {isSubmitting && <Loader2 className="animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
