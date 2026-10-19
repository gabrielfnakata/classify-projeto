import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"
import fullLogo from "@/assets/logo/full-logo.svg?raw"
import smallLogo from "@/assets/logo/small-logo.svg?raw"

interface LogoProps {
  variant?: "full" | "small"
  tone?: "sidebar" | "page"
  className?: string
}

export function Logo({ variant = "full", tone = "sidebar", className }: LogoProps) {
  return (
    <span
      role="img"
      aria-label="Classify Logo"
      style={{ "--logo-text": `var(--logo-text-${tone})` } as CSSProperties}
      className={cn("block [&>svg]:h-full [&>svg]:w-full", className)}
      dangerouslySetInnerHTML={{ __html: variant === "small" ? smallLogo : fullLogo }}
    />
  )
}
