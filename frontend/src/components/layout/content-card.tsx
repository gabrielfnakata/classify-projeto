import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ContentCardProps {
  children: ReactNode
  className?: string
}

export function ContentCard({ children, className }: ContentCardProps) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-border bg-panel-soft p-6 text-card-foreground shadow-sm transition-colors",
        className
      )}
    >
      {children}
    </div>
  )
}