import { useEffect, useState, type ReactNode } from "react"
import { Camera, CircleCheck, LockKeyhole, SquarePen, UserX } from "lucide-react"

import api from "@/services/api"
import { Avatar } from "@/components/common/avatar"
import { EmptyState } from "@/components/common/empty-state"
import { ContentCard } from "@/components/layout/content-card"
import { PageHeader } from "@/components/layout/page-header"
import { AvatarPickerDialog } from "@/components/profile/AvatarPickerDialog"
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog"
import { EditProfileDialog } from "@/components/profile/EditProfileDialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { formatIsoDateBR } from "@/shared/utils/date-formatter"
import { formatCpf, formatTelephone } from "@/shared/utils/masks"
import type { ProfileDTO } from "@/shared/dtos/profile/ProfileDTO"

interface ProfileFieldProps {
  label: string
  value: string | null | undefined
}

function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <div className="min-w-0">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 truncate text-base text-muted-foreground">{value || "—"}</p>
    </div>
  )
}

interface ProfileSectionProps {
  title: string
  children: ReactNode
}

function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <section className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0 lg:px-8 lg:py-0 lg:first:pl-0 lg:last:pr-0">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">{children}</div>
    </section>
  )
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const { avatarSrc, reloadUser } = useCurrentUser()
  const [notice, setNotice] = useState<string | null>(null)

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    api.get<ProfileDTO>("/employee/me", { data: {}, skipExceptionModal: true })
      .then((res) => {
        setProfile(res.data)
        setFailed(false)
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }, [refreshKey])

  const loadProfile = () => {
    setLoading(true)
    setRefreshKey((key) => key + 1)
  }

  useEffect(() => {
    if (!notice) return
    const timeout = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timeout)
  }, [notice])

  return (
    <div className="flex h-full w-full flex-col p-4 sm:p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <PageHeader title="Meu Perfil" />

        {notice && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm text-success-foreground">
            <CircleCheck className="size-4 text-success-foreground" />
            {notice}
          </div>
        )}

        {loading ? (
          <ContentCard className="flex flex-col gap-8 p-8 lg:p-10">
            <div className="flex items-center gap-6">
              <Skeleton className="h-28 w-28 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </ContentCard>
        ) : failed || !profile ? (
          <EmptyState
            icon={UserX}
            title="Não foi possível carregar seu perfil"
            description="Verifique se seu usuário está vinculado a um funcionário e tente novamente."
            action={<Button variant="outline" onClick={loadProfile}>Tentar novamente</Button>}
          />
        ) : (
          <ContentCard className="flex flex-col gap-8 p-5 sm:p-8 lg:p-10">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
                <button
                  type="button"
                  onClick={() => setAvatarOpen(true)}
                  title="Alterar foto de perfil"
                  className="group relative shrink-0 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Avatar name={profile.name} seed="usuario-logado" src={avatarSrc} size="xl" className="h-24 w-24 text-3xl sm:h-28 sm:w-28" />
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Camera className="size-7" />
                  </span>
                  <span className="absolute -right-0.5 -bottom-0.5 flex size-9 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                    <Camera className="size-4" />
                  </span>
                </button>
                <div className="w-full min-w-0">
                  <p className="truncate text-2xl font-bold capitalize text-foreground">
                    {profile.name.toLowerCase()}
                  </p>
                  <p className="truncate text-base text-muted-foreground">{profile.email}</p>
                </div>
              </div>
              {profile.role && (
                <span className="w-fit shrink-0 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground">
                  {profile.role.description}
                </span>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
              <ProfileSection title="Informações Pessoais">
                <ProfileField label="Data de Nascimento" value={formatIsoDateBR(profile.birthDate)} />
                <ProfileField label="CPF" value={formatCpf(profile.cpf)} />
              </ProfileSection>
              <ProfileSection title="Contato">
                <ProfileField label="E-mail" value={profile.email} />
                <ProfileField label="Telefone" value={formatTelephone(profile.telephones[0]?.number)} />
              </ProfileSection>
              <ProfileSection title="Informações Profissionais">
                <ProfileField label="Cargo" value={profile.role?.description} />
                <ProfileField label="Data de Contratação" value={formatIsoDateBR(profile.hireDate)} />
              </ProfileSection>
            </div>

            <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" size="lg" className="px-4" onClick={() => setPasswordOpen(true)}>
                <LockKeyhole />
                Alterar Senha
              </Button>
              <Button size="lg" className="px-4" onClick={() => setEditOpen(true)}>
                <SquarePen />
                Editar Perfil
              </Button>
            </div>

            <EditProfileDialog
              open={editOpen}
              profile={profile}
              onClose={() => setEditOpen(false)}
              onSaved={(updated) => {
                setProfile(updated)
                setEditOpen(false)
                reloadUser().catch(() => undefined)
                setNotice("Perfil atualizado com sucesso.")
              }}
            />
            <AvatarPickerDialog
              open={avatarOpen}
              name={profile.name}
              onClose={() => setAvatarOpen(false)}
              onSaved={() => {
                setAvatarOpen(false)
                setNotice("Foto de perfil atualizada.")
              }}
            />
            <ChangePasswordDialog
              open={passwordOpen}
              onClose={() => setPasswordOpen(false)}
              onChanged={() => {
                setPasswordOpen(false)
                setNotice("Senha alterada com sucesso.")
              }}
            />
          </ContentCard>
        )}
      </div>
    </div>
  )
}
