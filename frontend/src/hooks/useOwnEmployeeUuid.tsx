import { useEffect, useState } from "react"
import api from "@/services/api"
import type { ProfileDTO } from "@/shared/dtos/profile/ProfileDTO"

export function useOwnEmployeeUuid(enabled: boolean) {
  const [uuid, setUuid] = useState("")

  useEffect(() => {
    if (!enabled) return
    api.get<ProfileDTO>("/employee/me", { data: {} }).then((response) => setUuid(response.data.uuid))
  }, [enabled])

  return uuid
}
