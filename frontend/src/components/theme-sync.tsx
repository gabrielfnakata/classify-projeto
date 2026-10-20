import { useEffect } from "react"

import api from "@/services/api"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/components/theme-provider"
import type { ThemeSettingDTO } from "@/shared/dtos/theme/ThemeSettingDTO"

export function ThemeSync() {
  const { signed } = useAuth()
  const { setDefaults } = useTheme()

  useEffect(() => {
    if (!signed) return

    api.get<ThemeSettingDTO>("/user/default-theme", { data: {}, skipExceptionModal: true })
      .then(({ data }) => setDefaults({ theme: data.colorMode, accent: data.accent }))
      .catch(() => undefined)
  }, [signed, setDefaults])

  return null
}
