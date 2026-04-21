import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionTitleProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function SectionTitle({
  title,
  description,
  action,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
        className
      )}
    >
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>

        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}