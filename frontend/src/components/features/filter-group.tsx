import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FilterGroupProps {
  label: string
  children: ReactNode
  className?: string
}

export function FilterGroup({ label, children, className }: FilterGroupProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}
