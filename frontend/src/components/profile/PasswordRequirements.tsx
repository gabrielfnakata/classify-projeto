import { Check, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { PASSWORD_REQUIREMENTS } from "@/validation/ProfileSchema"

interface PasswordRequirementsProps {
  password: string
  touched?: boolean
  className?: string
}

export function PasswordRequirements({ password, touched = false, className }: PasswordRequirementsProps) {
  return (
    <ul className={cn("flex flex-col gap-1", className)}>
      {PASSWORD_REQUIREMENTS.map((requirement) => {
        const met = requirement.test(password)
        return (
          <li
            key={requirement.label}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              met ? "text-success-foreground" : touched ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {met ? <Check className="size-3.5" /> : <X className="size-3.5" />}
            {requirement.label}
          </li>
        )
      })}
    </ul>
  )
}
