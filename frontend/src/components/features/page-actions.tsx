import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageActionsProps {
  children: ReactNode
  align?: "left" | "right" | "between"
  className?: string
}

const alignClasses = {
  left: "justify-start",
  right: "justify-end",
  between: "justify-between",
}

export function PageActions({
  children,
  align = "right",
  className,
}: PageActionsProps) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-wrap items-center gap-3",
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  )
}