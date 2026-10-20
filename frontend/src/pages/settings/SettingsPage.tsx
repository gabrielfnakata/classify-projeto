import { useEffect, useState } from "react"
import { CircleCheck } from "lucide-react"

import api from "@/services/api"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/components/theme-provider"
import { ContentCard } from "@/components/layout/content-card"
import { PageHeader } from "@/components/layout/page-header"
import { ThemePicker } from "@/components/settings/ThemePicker"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Roles } from "@/shared/models/enums/roles"
import { ACCENTS, THEMES, USER_THEMES, type Accent, type Theme } from "@/shared/models/theme"
import type { ThemeSettingDTO } from "@/shared/dtos/theme/ThemeSettingDTO"

const labelOf = (options: readonly { value: string; label: string }[], value: string) =>
  options.find((option) => option.value === value)?.label

export default function SettingsPage() {
  const { userData } = useAuth()
  const { theme, setTheme, defaults, setDefaults, isCustomized, resetToDefaults } = useTheme()
  const [defaultTheme, setDefaultTheme] = useState<Theme>(defaults.theme)
  const [defaultAccent, setDefaultAccent] = useState<Accent>(defaults.accent)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const isAdmin = userData?.role === Roles.ADMIN
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  const resolvedTheme = theme === "system" ? (prefersDark ? "dark" : "light") : theme
  const defaultsChanged = defaultTheme !== defaults.theme || defaultAccent !== defaults.accent

  useEffect(() => {
    setDefaultTheme(defaults.theme)
    setDefaultAccent(defaults.accent)
  }, [defaults])

  useEffect(() => {
    if (!notice) return
    const timeout = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timeout)
  }, [notice])

  const saveDefaults = async () => {
    setSaving(true)
    try {
      const { data } = await api.put<ThemeSettingDTO>("/user/default-theme", {
        colorMode: defaultTheme,
        accent: defaultAccent,
      })
      setDefaults({ theme: data.colorMode, accent: data.accent })
      setNotice("Tema padrão atualizado com sucesso.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col p-4 sm:p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <PageHeader title="Configurações" />

        {notice && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm text-success-foreground">
            <CircleCheck className="size-4 text-success-foreground" />
            {notice}
          </div>
        )}

        <ContentCard className="flex flex-col gap-8 p-5 sm:p-8 lg:p-10">
          <section className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Minha aparência</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha entre o modo claro e o escuro. A cor de destaque é definida pelo administrador. Sua escolha vale apenas neste navegador.
              </p>
            </div>

            <ThemePicker themes={USER_THEMES} theme={resolvedTheme} onThemeChange={setTheme} />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Tema padrão: {labelOf(THEMES, defaults.theme)} · {labelOf(ACCENTS, defaults.accent)}
              </p>
              {isCustomized && (
                <Button variant="outline" onClick={resetToDefaults}>
                  Usar o modo padrão
                </Button>
              )}
            </div>
          </section>

          {isAdmin && (
            <>
              <Separator />

              <section className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Tema padrão do sistema</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Vale para todos os usuários que não escolheram um tema próprio.
                  </p>
                </div>

                <ThemePicker
                  theme={defaultTheme}
                  accent={defaultAccent}
                  onThemeChange={setDefaultTheme}
                  onAccentChange={setDefaultAccent}
                />

                <div className="flex sm:justify-end">
                  <Button size="lg" className="px-4" disabled={!defaultsChanged || saving} onClick={saveDefaults}>
                    Salvar tema padrão
                  </Button>
                </div>
              </section>
            </>
          )}
        </ContentCard>
      </div>
    </div>
  )
}
