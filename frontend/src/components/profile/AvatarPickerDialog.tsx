import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { Check, ImageUp, Loader2, UserRound } from "lucide-react"

import { Avatar } from "@/components/common/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { cropImageToSquare } from "@/lib/image"
import { cn } from "@/lib/utils"
import { AVATAR_PRESETS, avatarPresetSrc } from "@/shared/models/avatar-presets"
import type { ApiExceptionPayload } from "@/services/api"

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"]
const MAX_ORIGINAL_SIZE = 10 * 1024 * 1024

type Selection =
  | { kind: "current" }
  | { kind: "preset"; preset: string }
  | { kind: "photo"; blob: Blob; url: string }
  | { kind: "none" }

interface AvatarPickerDialogProps {
  open: boolean
  name: string
  onClose: () => void
  onSaved: () => void
}

export function AvatarPickerDialog({ open, name, onClose, onSaved }: AvatarPickerDialogProps) {
  const { avatar, avatarSrc, choosePreset, uploadPhoto, removeAvatar } = useCurrentUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selection, setSelection] = useState<Selection>({ kind: "current" })
  const [processing, setProcessing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const photoUrl = selection.kind === "photo" ? selection.url : null
  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
  }, [photoUrl])

  const previewSrc =
    selection.kind === "current" ? avatarSrc
      : selection.kind === "preset" ? avatarPresetSrc(selection.preset)
        : selection.kind === "photo" ? selection.url
          : null

  const selectedPreset =
    selection.kind === "preset" ? selection.preset
      : selection.kind === "current" && !avatar?.hasPhoto ? avatar?.preset ?? null
        : null

  const hasAvatar = Boolean(avatar?.preset || avatar?.hasPhoto)

  function close() {
    setSelection({ kind: "current" })
    setError(null)
    onClose()
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Selecione uma imagem PNG, JPEG ou WEBP.")
      return
    }
    if (file.size > MAX_ORIGINAL_SIZE) {
      setError("A imagem deve ter no máximo 10 MB.")
      return
    }

    setError(null)
    setProcessing(true)
    try {
      const blob = await cropImageToSquare(file)
      setSelection({ kind: "photo", blob, url: URL.createObjectURL(blob) })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível processar a imagem.")
    } finally {
      setProcessing(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      if (selection.kind === "preset") await choosePreset(selection.preset)
      else if (selection.kind === "photo") await uploadPhoto(selection.blob)
      else if (selection.kind === "none") await removeAvatar()

      setSelection({ kind: "current" })
      onSaved()
    } catch (err: unknown) {
      const e = err as { response?: { data?: ApiExceptionPayload } }
      setError(e?.response?.data?.message ?? "Não foi possível salvar a foto de perfil.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border p-5 pr-12">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <UserRound className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle>Foto de perfil</DialogTitle>
              <DialogDescription>Envie uma foto sua ou escolha um dos avatares prontos.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5 p-5">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
            <Avatar name={name} seed="usuario-logado" src={previewSrc} size="xl" className="h-24 w-24 text-2xl" />
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={processing || saving}
              >
                {processing ? <Loader2 className="animate-spin" /> : <ImageUp />}
                Enviar foto
              </Button>
              <p className="text-center text-xs text-muted-foreground sm:text-left">
                PNG, JPEG ou WEBP. A imagem é recortada em formato quadrado.
              </p>
              {(hasAvatar || selection.kind === "photo" || selection.kind === "preset") && (
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs text-muted-foreground"
                  onClick={() => setSelection(hasAvatar ? { kind: "none" } : { kind: "current" })}
                  disabled={saving}
                >
                  Usar apenas as iniciais
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">Avatares prontos</p>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {AVATAR_PRESETS.map((preset) => {
                const selected = selectedPreset === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSelection({ kind: "preset", preset })}
                    aria-label={`Escolher ${preset}`}
                    aria-pressed={selected}
                    disabled={saving}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-full border-2 border-transparent transition-all outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50",
                      selected && "border-primary"
                    )}
                  >
                    <img src={avatarPresetSrc(preset) ?? undefined} alt="" className="h-full w-full" draggable={false} />
                    {selected && (
                      <span className="absolute right-0.5 bottom-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="flex-1" onClick={close} disabled={saving}>
            Cancelar
          </Button>
          <Button className="flex-1" type="button" onClick={handleSave} disabled={saving || processing || selection.kind === "current"}>
            {saving && <Loader2 className="animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
