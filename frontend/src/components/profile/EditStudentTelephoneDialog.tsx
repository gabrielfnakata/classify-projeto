import { useState } from "react"
import { Form, Formik, type FormikHelpers } from "formik"
import { Loader2, Phone } from "lucide-react"

import api, { type ApiExceptionPayload } from "@/services/api"
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
import { StudentTelephoneValidationSchema } from "@/validation/StudentTelephoneSchema"
import type { StudentProfileDTO } from "@/shared/dtos/profile/StudentProfileDTO"
import type { TelephoneDTO } from "@/shared/dtos/telephone/TelephoneDTO"

interface EditStudentTelephoneDialogProps {
  open: boolean
  telephones: TelephoneDTO[]
  onClose: () => void
  onSaved: (telephones: TelephoneDTO[]) => void
}

interface EditStudentTelephoneForm {
  telephone: string
}

export function EditStudentTelephoneDialog({ open, telephones, onClose, onSaved }: EditStudentTelephoneDialogProps) {
  const [error, setError] = useState<string | null>(null)

  const initialValues: EditStudentTelephoneForm = {
    telephone: formatTelephone(telephones[0]?.number),
  }

  async function handleSubmit(values: EditStudentTelephoneForm, helpers: FormikHelpers<EditStudentTelephoneForm>) {
    setError(null)

    try {
      const { data } = await api.put<StudentProfileDTO>(
        "/student/me/telephone",
        parseTelephone(values.telephone),
        { skipExceptionModal: true }
      )
      onSaved(data.telephones)
    } catch (err: unknown) {
      const e = err as { response?: { data?: ApiExceptionPayload } }
      setError(e?.response?.data?.message ?? "Não foi possível atualizar o telefone.")
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
          validationSchema={StudentTelephoneValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ isSubmitting, isValid, dirty }) => (
            <Form>
              <DialogHeader className="border-b border-border p-5 pr-12">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <DialogTitle>Editar telefone</DialogTitle>
                </div>
              </DialogHeader>

              <div className="flex flex-col gap-6 p-5">
                <PhoneInput name="telephone" label="Telefone" placeholder="(00) 00000-0000" required />
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
